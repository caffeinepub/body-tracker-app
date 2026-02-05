import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export type Time = bigint;
export type Gender = {
    __kind__: "other";
    other: string;
} | {
    __kind__: "female";
    female: null;
} | {
    __kind__: "male";
    male: null;
};
export interface Measurement {
    value: number;
    date: Time;
    unit: Variant_cm_inches;
}
export interface DailyEntry {
    weight?: Measurement;
    bodyFatPercent?: number;
    workouts: Array<Workout>;
    date: Time;
    hips?: Measurement;
    chest?: Measurement;
    image?: ExternalBlob;
    waist?: Measurement;
}
export interface Workout {
    duration: bigint;
    date: Time;
    muscleGroups: string;
}
export interface Units {
    weight: Variant_kg_lbs;
    measurements: Variant_cm_inches;
}
export interface UserProfile {
    age: bigint;
    name: string;
    gender: Gender;
    units: Units;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export enum Variant_cm_inches {
    cm = "cm",
    inches = "inches"
}
export enum Variant_kg_lbs {
    kg = "kg",
    lbs = "lbs"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createOrUpdateEntry(entry: DailyEntry): Promise<void>;
    deleteEntry(date: Time): Promise<void>;
    getAllEntries(): Promise<Array<DailyEntry>>;
    getBodyFatEntries(): Promise<Array<{
        bodyFatPercent: number;
        date: Time;
    }>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getChestEntries(): Promise<Array<Measurement>>;
    getComparisonEntries(target1: Time, target2: Time, target3: Time): Promise<{
        entry1?: DailyEntry;
        entry2?: DailyEntry;
        entry3?: DailyEntry;
    }>;
    getEntryByDate(date: Time): Promise<DailyEntry | null>;
    getHipsEntries(): Promise<Array<Measurement>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getWaistEntries(): Promise<Array<Measurement>>;
    getWeightEntries(): Promise<Array<Measurement>>;
    getWorkoutDurationTimeSeries(): Promise<Array<{
        date: Time;
        totalDuration: bigint;
    }>>;
    getWorkoutEntries(): Promise<Array<Workout>>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
}
