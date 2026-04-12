/* eslint-disable */

// Don't know how, but the packages types are somehow broken.
// They have simply been copypasted here directly, but that is enough to make them work.

declare module 'libre-link-unofficial-api' {
  export declare enum LibreLinkUpEndpoints {
    Login = 'llu/auth/login',
    Country = 'llu/config/country?country=DE',
    Connections = 'llu/connections',
  }
  /**
   * @description A response from the Libre Link Up API.
   */
  export interface LibreResponse {
    status: number;
    data?: Record<string, any>;
    error?: Record<string, any>;
  }
  /**
   * @description The successful login response from the Libre Link Up API.
   */
  export interface LibreLoginResponse extends LibreResponse {
    data: {
      /**
       * @description The user object from the Libre Link Up API.
       */
      user: LibreUser;
      /**
       * @description The messages from the Libre Link Up API. Usually only the count of unread messages.
       */
      messages: LibreDataMessages;
      /**
       * @description The notifications from the Libre Link Up API. Usually only the count of unresolved notifications.
       */
      notifications: LibreNotifications;
      /**
       * @description The authentication ticket from the Libre Link Up API. The authentication token is stored here.
       */
      authTicket: LibreAuthTicket;
      invitations: string[] | null;
      trustedDeviceToken: string | '';
    };
  }
  /**
   * @description The redirect response from the Libre Link Up API. Usually happens when attempting to log in with the wrong region.
   */
  export interface LibreRedirectResponse extends LibreResponse {
    data: {
      redirect: boolean;
      region: string;
    };
  }
  /**
   * @description An error response from the Libre Link Up API.
   */
  export interface LibreErrorResponse extends LibreResponse {
    error: {
      message: string;
    };
  }
  export interface LibreConnectionResponse extends LibreResponse {
    status: number;
    data: {
      connection: LibreConnection;
      activeSensors: LibreActiveSensor[];
      graphData: RawGlucoseReading[];
    };
    ticket: Ticket;
  }
  export interface LibreLogbookResponse extends LibreResponse {
    status: number;
    data: RawGlucoseReading[];
    ticket: Ticket;
  }
  export interface LibreActiveSensor {
    sensor: LibreSensor;
    device: LibreDevice;
  }
  interface LibreDevice {
    did: string;
    dtid: number;
    v: string;
    ll: number;
    hl: number;
    u: number;
    fixedLowAlarmValues: LibreFixedLowAlarmValues;
    alarms: boolean;
  }
  interface LibreFixedLowAlarmValues {
    mgdl: number;
    mmoll: number;
  }
  interface LibreSensor {
    deviceId: string;
    sn: string;
    a: number;
    w: number;
    pt: number;
  }
  /**
   * @description A connection object from the Libre Link Up API.
   */
  export interface LibreConnection {
    id: string;
    patientId: string;
    country: string;
    status: number;
    firstName: string;
    lastName: string;
    targetLow: number;
    targetHigh: number;
    uom: number;
    sensor: LibreSensor;
    alarmRules: LibreAlarmRules;
    glucoseMeasurement: RawGlucoseReading;
    glucoseItem: RawGlucoseReading;
    glucoseAlarm: null;
    patientDevice: LibreDevice;
    created: number;
  }
  /**
   * @description A user object from the Libre Link Up API.
   */
  export interface LibreUser {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    dateOfBirth: Date;
    /** Country of the user in alpha-2 format. eg. PL, DE, GB etc. */
    country: string;
    /** The language of the user interface in culture code format. eg. en-GB, de-DE, pl-PL etc. */
    uiLanguage: string;
    /** The language the system uses to communicate with the user (?) in culture code format. eg. en-GB, de-DE, pl-PL etc. */
    communicationLanguage: string;
    /** The account type of the user. For patient it's 'pat'. */
    accountType: string;
    created: Date;
    lastLogin: Date;
    uom: string;
    dateFormat: string;
    timeFormat: string;
    emailDay: number[];
    system: LibreSystem;
    details: Record<string, any>;
    programs: Record<string, any>;
    /** The practices that can access the user's data. */
    practices: Record<string, LibrePractice>;
    /** The devices that the user has connected to the account. */
    devices: Record<string, LibreDevice>;
    consents: LibreConsents;
  }
  interface LibreAuthTicket {
    token: string;
    expires: number;
    duration: number;
  }
  interface LibreDataMessages {
    unread: number;
  }
  interface LibreNotifications {
    unresolved: number;
  }
  interface LibreConsents {
    llu?: Llu;
    realWorldEvidence: RealWorldEvidence;
  }
  interface Llu {
    policyAccept: number;
    touAccept: number;
  }
  interface RealWorldEvidence {
    policyAccept: number;
    touAccept: number;
    history: {
      policyAccept: number;
      declined?: boolean;
    }[];
  }
  interface LibreSystem {
    messages: LibreSystemMessages;
  }
  interface LibreSystemMessages {
    appReviewBanner: number;
    firstUsePhoenix: number;
    firstUsePhoenixReportsDataMerged: number;
    lluGettingStartedBanner: number;
    lluNewFeatureModal: number;
    lluOnboarding?: number;
    lvWebPostRelease: string;
    streamingTourMandatory: number;
  }
  /** The practice facility that can access the user's data. */
  interface LibrePractice {
    id: string;
    practiceId: string;
    name: string;
    address1: string;
    city: string;
    state: string;
    zip: string;
    phoneNumber: string;
    records: null;
  }
  interface LibreDevice {
    id: string;
    nickname: string;
    sn: string;
    type: number;
    uploadDate: number;
  }
  interface LibreAlarmRules {
    c: boolean;
    h: H;
    f: F;
    l: F;
    nd: Nd;
    p: number;
    r: number;
    std: Std;
  }
  interface F {
    th: number;
    thmm: number;
    d: number;
    tl: number;
    tlmm: number;
    on?: boolean;
  }
  interface H {
    on: boolean;
    th: number;
    thmm: number;
    d: number;
    f: number;
  }
  interface Nd {
    i: number;
    r: number;
    l: number;
  }
  interface Std {}
  export interface RawGlucoseReading {
    FactoryTimestamp: string;
    Timestamp: string;
    type: number;
    ValueInMgPerDl: number;
    TrendArrow?: number;
    TrendMessage?: null;
    MeasurementColor: number;
    GlucoseUnits: number;
    Value: number;
    isHigh: boolean;
    isLow: boolean;
  }
  export interface GlucoseReading {
    timestamp: Date;
    value: number;
    measurementColor: MeasurementColor;
    isHigh: boolean;
    isLow: boolean;
  }
  interface Ticket {
    token: string;
    expires: number;
    duration: number;
  }
  export declare enum MeasurementColor {
    Red = 0,
    Green = 1,
    Yellow = 2,
    Orange = 3,
  }
  export type TrendType =
    | 'NotComputable'
    | 'SingleDown'
    | 'FortyFiveDown'
    | 'Flat'
    | 'FortyFiveUp'
    | 'SingleUp';
  export declare enum Trend {
    'NotComputable' = 0,
    'SingleDown' = 1,
    'FortyFiveDown' = 2,
    'Flat' = 3,
    'FortyFiveUp' = 4,
    'SingleUp' = 5,
  }

  export declare class GlucoseReading {
    _raw: RawGlucoseReading;
    _options: {
      targetHigh: number;
      targetLow: number;
    };
    /**
     * @description The timestamp of the glucose reading.
     */
    timestamp: Date;
    /**
     * @description The value of the glucose reading in mg/dL.
     */
    value: number;
    /**
     * @description The measurement color of the glucose reading. See {@link MeasurementColor}.
     */
    measurementColor: MeasurementColor;
    /**
     * @description Whether the glucose reading is high, based on the patient's settings. Calculated by the library.
     */
    isHigh: boolean;
    /**
     * @description Whether the glucose reading is low, based on the patient's settings. Calculated by the library.
     */
    isLow: boolean;
    /**
     * @description The trend of the glucose reading. See {@link Trend}.
     */
    trend: Trend;
    constructor(
      _raw: RawGlucoseReading,
      _options?: {
        targetHigh: number;
        targetLow: number;
      },
    );
    /**
     * @description The mmol value of the glucose reading.
     */
    get mmol(): string;
    /**
     * @description The mg/dL value of the glucose reading.
     */
    get mgDl(): number;
    /**
     * @description The type of the trend. {@see TrendType}
     */
    get trendType(): TrendType;
  }

  interface LibreLinkClientOptions {
    email?: string;
    password?: string;
    patientId?: string;
    cache?: boolean;
    lluVersion?: string;
  }

  export declare class LibreLinkClient {
    private options;
    private apiUrl;
    private accessToken;
    private patientId;
    private lluVersion;
    private cache;
    constructor(options?: LibreLinkClientOptions);
    /**
     * @description Get the user data. Only available after logging in.
     */
    get me(): LibreUser | null;
    /**
     * @description Log into the Libre Link Up API using the provided credentials.
     */
    login(): Promise<LibreLoginResponse>;
    /**
     * @description Read the data from the Libre Link Up API.
     * @returns The latest glucose measurement from the Libre Link Up API.
     */
    read(): Promise<GlucoseReading>;
    /**
     * @description Read the history data from the Libre Link Up API.
     */
    history(): Promise<GlucoseReading[]>;
    /**
     * @description Read the logbook data from manual scans from the Libre Link Up API.
     */
    logbook(): Promise<GlucoseReading[]>;
    /**
     * @description Stream the readings from the Libre Link Up API.
     * @param intervalMs The interval between each reading. Default is 90 seconds.
     */
    stream(intervalMs?: number): AsyncGenerator<GlucoseReading, void, unknown>;
    /**
     * @description Fetch the reading from the Libre Link Up API. Use to obtain the raw reading and more.
     * @returns The response from the Libre Link Up API.
     */
    fetchReading(): Promise<LibreConnectionResponse>;
    /**
     * @description Fetch the logbook from the Libre Link Up API. Use to obtain the list of manual scanned readings.
     * @returns The response from the Libre Link Up API.
     */
    fetchLogbook(): Promise<LibreLogbookResponse>;
    /**
     * @description Get the connections from the Libre Link Up API.
     */
    fetchConnections(): Promise<any>;
    /**
     * @description Get the patient ID from the connections.
     */
    private getPatientId;
    /**
     * @description Find the region in the Libre Link Up API. This is used when the API returns a redirect.
     * @param region The region to find.
     * @returns The server URL for the region.
     */
    private findRegion;
    /**
     * @description A generic fetcher for the Libre Link Up API.
     * @param endpoint
     * @param options
     */
    private _fetcher;
    /**
     * @description A verbose logger.
     * @param args
     */
    private verbose;
    /**
     * @description Cache a value, if caching is enabled.
     * @param key The key to cache the value under.
     * @param value The value to cache.
     */
    private setCache;
    /**
     * @description Clear the cache.
     */
    clearCache(): void;
  }
}
