import Array "mo:core/Array";
import List "mo:core/List";
import Map "mo:core/Map";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  module DailyEntry {
    public func compareByDate(entry1 : DailyEntry, entry2 : DailyEntry) : Order.Order {
      if (entry1.date < entry2.date) { #less } else if (entry1.date > entry2.date) { #greater } else {
        #equal;
      };
    };
  };

  module Measurement {
    public func compareByDate(measurement1 : Measurement, measurement2 : Measurement) : Order.Order {
      if (measurement1.date < measurement2.date) { #less } else if (measurement1.date > measurement2.date) {
        #greater;
      } else { #equal };
    };
  };

  module Workout {
    public func compareByDate(workout1 : Workout, workout2 : Workout) : Order.Order {
      if (workout1.date < workout2.date) { #less } else if (workout1.date > workout2.date) {
        #greater;
      } else { #equal };
    };
  };

  // Initialize access control
  let accessControlState = AccessControl.initState();

  // External modules
  include MixinStorage();
  include MixinAuthorization(accessControlState);

  // Data types
  public type Gender = {
    #male;
    #female;
    #other : Text;
  };

  public type Units = {
    weight : {
      #kg;
      #lbs;
    };
    measurements : {
      #cm;
      #inches;
    };
  };

  public type UserProfile = {
    name : Text;
    age : Nat;
    gender : Gender;
    units : Units;
  };

  public type Measurement = {
    value : Float;
    unit : {
      #cm;
      #inches;
    };
    date : Time.Time;
  };

  public type Workout = {
    muscleGroups : Text;
    duration : Nat;
    date : Time.Time;
  };

  public type DailyEntry = {
    date : Time.Time;
    image : ?Storage.ExternalBlob;
    weight : ?Measurement;
    chest : ?Measurement;
    waist : ?Measurement;
    hips : ?Measurement;
    bodyFatPercent : ?Float; // new field
    workouts : [Workout];
  };

  // Persistent state
  let userProfiles = Map.empty<Principal, UserProfile>();
  let userEntries = Map.empty<Principal, List.List<DailyEntry>>();

  // User profile management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };
    userProfiles.get(caller);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  // Daily entry CRUD operations
  public shared ({ caller }) func createOrUpdateEntry(entry : DailyEntry) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };

    let existingEntries = switch (userEntries.get(caller)) {
      case (null) { List.empty<DailyEntry>() };
      case (?entries) { entries };
    };

    let filteredEntries = existingEntries.filter(
      func(e) {
        e.date != entry.date;
      }
    );

    filteredEntries.add(entry);
    userEntries.add(caller, filteredEntries);
  };

  public query ({ caller }) func getEntryByDate(date : Time.Time) : async ?DailyEntry {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };

    switch (userEntries.get(caller)) {
      case (null) { null };
      case (?entries) {
        switch (entries.find(func(e) { e.date == date })) {
          case (null) { null };
          case (?entry) { ?entry };
        };
      };
    };
  };

  public shared ({ caller }) func deleteEntry(date : Time.Time) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };
    switch (userEntries.get(caller)) {
      case (null) { () };
      case (?entries) {
        let filteredEntries = entries.filter(func(e) { e.date != date });
        userEntries.add(caller, filteredEntries);
      };
    };
  };

  // New comparison logic supporting 3 arbitrary targets
  public query ({ caller }) func getComparisonEntries(target1 : Time.Time, target2 : Time.Time, target3 : Time.Time) : async {
    entry1 : ?DailyEntry;
    entry2 : ?DailyEntry;
    entry3 : ?DailyEntry;
  } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };

    switch (userEntries.get(caller)) {
      case (null) {
        {
          entry1 = null;
          entry2 = null;
          entry3 = null;
        };
      };
      case (?entries) {
        let findClosest = func(target : Time.Time) : ?DailyEntry {
          var closest : ?DailyEntry = null;
          var closestDiff : Int = 0;

          entries.forEach(
            func(entry) {
              if (entry.date <= target) {
                let diff = target - entry.date;
                switch (closest) {
                  case (null) {
                    closest := ?entry;
                    closestDiff := diff;
                  };
                  case (?current) {
                    if (diff < closestDiff) {
                      closest := ?entry;
                      closestDiff := diff;
                    };
                  };
                };
              };
            }
          );
          closest;
        };

        {
          entry1 = findClosest(target1);
          entry2 = findClosest(target2);
          entry3 = findClosest(target3);
        };
      };
    };
  };

  // Analytics endpoints for weight and workouts
  public query ({ caller }) func getWeightEntries() : async [Measurement] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };

    switch (userEntries.get(caller)) {
      case (null) { [] };
      case (?entries) {
        let measurements = List.empty<Measurement>();
        entries.forEach(
          func(entry) {
            switch (entry.weight) {
              case (null) {};
              case (?measurement) { measurements.add(measurement) };
            };
          }
        );
        measurements.toArray().sort(Measurement.compareByDate);
      };
    };
  };

  public query ({ caller }) func getWorkoutEntries() : async [Workout] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };

    switch (userEntries.get(caller)) {
      case (null) { [] };
      case (?entries) {
        let workouts = List.empty<Workout>();
        entries.forEach(
          func(entry) {
            workouts.addAll(entry.workouts.values());
          }
        );
        workouts.toArray().sort(Workout.compareByDate);
      };
    };
  };

  public query ({ caller }) func getBodyFatEntries() : async [{ date : Time.Time; bodyFatPercent : Float }] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };

    switch (userEntries.get(caller)) {
      case (null) { [] };
      case (?entries) {
        let bodyFatEntries = List.empty<{ date : Time.Time; bodyFatPercent : Float }>();
        entries.forEach(
          func(entry) {
            switch (entry.bodyFatPercent) {
              case (null) {};
              case (?bodyFatPercent) {
                bodyFatEntries.add({
                  date = entry.date;
                  bodyFatPercent;
                });
              };
            };
          }
        );
        bodyFatEntries.toArray().sort(
          func(a, b) {
            if (a.date < b.date) { #less } else if (a.date > b.date) {
              #greater;
            } else {
              #equal;
            };
          }
        );
      };
    };
  };

  public query ({ caller }) func getAllEntries() : async [DailyEntry] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };

    switch (userEntries.get(caller)) {
      case (null) { [] };
      case (?entries) {
        entries.toArray().sort(DailyEntry.compareByDate);
      };
    };
  };

  // New Time Series Endpoints for Measurements and Workout Duration
  public query ({ caller }) func getChestEntries() : async [Measurement] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };

    switch (userEntries.get(caller)) {
      case (null) { [] };
      case (?entries) {
        let measurements = List.empty<Measurement>();
        entries.toArray().sort(DailyEntry.compareByDate).forEach(
          func(entry) {
            switch (entry.chest) {
              case (null) {};
              case (?measurement) { measurements.add(measurement) };
            };
          }
        );
        measurements.toArray();
      };
    };
  };

  public query ({ caller }) func getWaistEntries() : async [Measurement] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };

    switch (userEntries.get(caller)) {
      case (null) { [] };
      case (?entries) {
        let measurements = List.empty<Measurement>();
        entries.toArray().sort(DailyEntry.compareByDate).forEach(
          func(entry) {
            switch (entry.waist) {
              case (null) {};
              case (?measurement) { measurements.add(measurement) };
            };
          }
        );
        measurements.toArray();
      };
    };
  };

  public query ({ caller }) func getHipsEntries() : async [Measurement] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };

    switch (userEntries.get(caller)) {
      case (null) { [] };
      case (?entries) {
        let measurements = List.empty<Measurement>();
        entries.toArray().sort(DailyEntry.compareByDate).forEach(
          func(entry) {
            switch (entry.hips) {
              case (null) {};
              case (?measurement) { measurements.add(measurement) };
            };
          }
        );
        measurements.toArray();
      };
    };
  };

  public query ({ caller }) func getWorkoutDurationTimeSeries() : async [{ date : Time.Time; totalDuration : Nat }] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };

    switch (userEntries.get(caller)) {
      case (null) { [] };
      case (?entries) {
        let filteredEntries = List.empty<(Time.Time, Nat)>();
        entries.forEach(
          func(entry) {
            let totalDuration = entry.workouts.foldLeft(
              0,
              func(acc, w) { acc + w.duration },
            );
            filteredEntries.add((entry.date, totalDuration));
          }
        );

        // Convert to array and sort by date
        let sortedEntries = filteredEntries.toArray().sort(
          func((dateA, _), (dateB, _)) {
            if (dateA < dateB) { #less } else if (dateA > dateB) { #greater } else {
              #equal;
            };
          }
        );

        // Map sorted entries to desired output
        sortedEntries.map(
          func((date, totalDuration)) {
            { date; totalDuration };
          }
        );
      };
    };
  };
};

