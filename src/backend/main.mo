import Array "mo:core/Array";
import List "mo:core/List";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Map "mo:core/Map";
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
    duration : Nat; // minutes
    date : Time.Time;
  };

  public type DailyEntry = {
    date : Time.Time;
    image : ?Storage.ExternalBlob;
    weight : ?Measurement;
    chest : ?Measurement;
    waist : ?Measurement;
    hips : ?Measurement;
    workouts : [Workout];
  };

  // Persistent state
  let userProfiles = Map.empty<Principal, UserProfile>();
  let userEntries = Map.empty<Principal, List.List<DailyEntry>>();

  // User profile management - Required by frontend
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
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

  // Legacy function for backward compatibility
  public shared ({ caller }) func saveUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Daily entry CRUD operations
  public shared ({ caller }) func createOrUpdateEntry(entry : DailyEntry) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create or update entries");
    };

    let existingEntries = switch (userEntries.get(caller)) {
      case (null) { List.empty<DailyEntry>() };
      case (?entries) { entries };
    };

    // Remove existing entry for the same date if present
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
      Runtime.trap("Unauthorized: Only users can access entries");
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
      Runtime.trap("Unauthorized: Only users can delete entries");
    };

    switch (userEntries.get(caller)) {
      case (null) { () };
      case (?entries) {
        let filteredEntries = entries.filter(func(e) { e.date != date });
        userEntries.add(caller, filteredEntries);
      };
    };
  };

  // Photo comparison setup (Day 1, 30, 90)
  public query ({ caller }) func getComparisonImages() : async {
    day1 : ?DailyEntry;
    day30 : ?DailyEntry;
    day90 : ?DailyEntry;
  } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access comparison images");
    };

    switch (userEntries.get(caller)) {
      case (null) {
        {
          day1 = null;
          day30 = null;
          day90 = null;
        };
      };
      case (?entries) {
        let now = Time.now();
        let day1 = entries.find(func(e) { e.date <= now and e.date > (now - 1 * 24 * 60 * 60 * 1000000000) });
        let day30 = entries.find(func(e) { e.date <= now and e.date > (now - 30 * 24 * 60 * 60 * 1000000000) });
        let day90 = entries.find(func(e) { e.date <= now and e.date > (now - 90 * 24 * 60 * 60 * 1000000000) });

        {
          day1;
          day30;
          day90;
        };
      };
    };
  };

  // Helper functions for analytics
  public query ({ caller }) func getWeightEntries() : async [Measurement] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access weight entries");
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
      Runtime.trap("Unauthorized: Only users can access workout entries");
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

  public query ({ caller }) func getAllEntries() : async [DailyEntry] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access entries");
    };

    switch (userEntries.get(caller)) {
      case (null) { [] };
      case (?entries) {
        entries.toArray().sort(DailyEntry.compareByDate);
      };
    };
  };
};
