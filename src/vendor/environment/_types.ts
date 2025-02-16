export interface AssetList {
  favicon: string; // favicon path (relative to /assets/)
  logo: string; // logo path (relative to /assets/)
  logo_tenant: string; // logo of the tenant path (relative to /assets/)
  login_background: string; // log-in screen background image path (relative to /assets/)
  dashboard_background: string; // dashboard background image path (relative to /assets/)
  privacy_policy: InternationalizedAsset; // privacy policy path, in markdown format (relative to /assets/)
  extra_locales?: LocalesAssets; // extra locales assets
  override_css?: string; // path to a CSS file to be loaded after the default CSS. Specially useful for overriding CSS variables of the theme
}

export interface InternationalizedAsset {
  es: string;
  en: string;

  [key: string]: string;
}

export interface LocalesAssets {
  glossary?: InternationalizedAsset;
  ui?: InternationalizedAsset;

  [key: string]: InternationalizedAsset | undefined;
}

export type Url = string; // URL of the page (relative to root, so for instance, url = 'map' will be accesible at https://web/map). Do not include the leading slash or trailing slash
export type Role = 'PILOT' | 'ADMIN' | 'MONITOR';

export interface Page {
  url: Url;
  component?: string; // Component to be loaded for this page (relative to /src/app/). If not specified, no component will be added to the router (simple page redirect)
  label: string; // Label of the page, to be shown in the MasterBarMenu
  roles: Role[]; // Roles that can access this page
  icon: string; // Icon to be shown in the MasterBarMenu (from BlueprintIcons)
}

export interface EditorHubButtons {
  url: Url;
  icon: string; // Icon  (from BlueprintIcons)
  label: string; // Label of the button, should have corresponding translation in the locales (ui)
  roles: Role[]; // Roles that can access this button
}

export enum ImplementationId {}
// This enum is used to identify specific implementations of a feature
// All related specific implementations of components should have the same id, and this id is set as a part of the file extension
// Example TestScreen.001.tsx, TestScreen.002.tsx, TestScreen.003.tsx, etc are all implementations of the same component

export interface Tenant {
  code: 'net2fly' | 'papacharlie' | 'cielum' | 'dev' | 'dinacia';
  specific_implementations?: ImplementationId[];
  short_name: string; //Title of the page
  assets: AssetList;
  features: {
    // Instead of having an array of pages and components, we have a list of features
    // This is due to the fact that certain features do not only represent a change in the MasterBarMenu, but also in other features
    // where shortcuts are added to features, or where features depend on others
    // for instance, Regular Flights can create operations if the Operations feature is enabled
    // this would be complicated to implement if the list of features was an array of pages and components

    [key: string]: {
      enabled: boolean;
      options?: { [key: string]: boolean | string | string[] };
    };

    // RealtimeMap
    RealtimeMap: {
      enabled: boolean;
      options: {
        hideOperationsControls: boolean; // Whether to hide filter by state and filter by specific operation in the realtime map
      };
    };
    // easy-webapp v3.0.x
    // Map can be disabled entirely

    // UsersHub
    UsersHub: {
      enabled: boolean;
    };
    // easy-webapp v3.0.x
    // Only the hub can be disabled, but users can still be created and used

    // Operations
    Operations:
      | {
          enabled: false;
        }
      | {
          enabled: true;
          options: {
            pilotCanCreateOperations: boolean; // Whether pilots can create operations
          };
        };
    // easy-webapp v3.0.x
    // Feature has individual feature points that can be enabled/disabled, or completely turned off

    // RegularFlights
    RegularFlights: {
      enabled: boolean;
    };
    // easy-webapp v3.0.x
    // Feature can be disabled entirely

    // Vehicles
    Vehicles: {
      enabled: boolean;
      options?: {
        hideUvin: boolean; // Whether to hide the UVIN field in the detailed vehicle information
      };
    };
    // easy-webapp v3.0.x
    // Feature can be disabled entirely

    // Uvrs
    Uvrs: {
      enabled: boolean;
    };
    // easy-webapp v3.0.x
    // Feature can be disabled entirely

    // Rfvs
    Rfvs: {
      enabled: boolean;
    };
    // easy-webapp v3.0.x
    // Feature can be disabled entirely

    // Trackers
    Trackers: {
      enabled: boolean;
    };
    // easy-webapp v3.0.x
    // Feature can be disabled entirely (hub, editor)

    // FlightRequests
    FlightRequests:
      | {
          enabled: false;
        }
      | {
          enabled: true;
          options: {
            liaisons: string[];
            coordinatorTypes: string[];
            defaultOperatorUsername: string;
          };
        };
    // easy-webapp v3.0.x
    // Feature can be disabled entirely
    // This emcompasses the following features:
    // - FlightRequests (editor, hub)
    // - Coordinators (editor, hub)
    // - Coordinations (hub)

    // BarLogo
    BarLogo:
      | {
          enabled: false;
        }
      | {
          enabled: true;
          options: {
            collapsedTransform: string;
          };
        };
    // easy-webapp v3.0.x
    // Feature can be disabled entirely
    // Shows the logo of the platform in the top of BarMenu
    // Allows to set for a transform for the logo for when the bar is collapsed (for instance, scale(0.5)) to show the emblem instead of the full logo

    // View public map button on login screen
    ViewPublicMapButtonOnLoginScreen:
      | {
          enabled: false;
        }
      | {
          enabled: true;
          options: {};
        };
    // easy-webapp v3.1.x
  };
  extras: {
    // Extra Pages
    pages?: Page[];
    // easy-webapp v3.0.x
    // Extra pages to be added to the MasterBarMenu
    // These will show up in the MasterBarMenu, but will not be accesible if the user does not have the required roles
    // These pages will be added at the end of the MasterBarMenu, on top of the bottom static items (home, profile, etc)
    // If component is specified, the page will be added to the router, and will be accesible at the specified URL

    // Extra Editor Hub buttons
    editor_hub_buttons?: EditorHubButtons[];
    // easy-webapp v3.0.x
    // Extra buttons to be added to the Editor Hub
    // These will show up in the Editor Hub, but will not be accesible if the user does not have the required roles
    // These buttons will be added at the end of the Editor Hub, after the default items

    // Banner across all pages
    banner?: {
      placement: 'top' | 'bottom';
      md: string; // Markdown text, to be parsed by react-markdown
    };
    // easy-webapp v3.0.x

    // Extra buttons in RealtimeMap
    realtime_map_buttons?: {
      label: string; // Label of the button, should have corresponding translation in the locales (ui)
      icon: string | null;
      path: string; // URL to redirect to when the button is clicked (from root)
    }[];

    // Add script for external client tracking
    // ex: <script type="text/javascript" id="hs-script-loader" async defer src="//js.hs-scripts.com/6079301.js"></script>
    external_client_tracking_script?: {
      id: string;
      src: string;
      element: string;
    };
    // easy-webapp v3.1.x
  };
}
