import {
  gql,
  ApolloClient,
  InMemoryCache,
  HttpLink,
  ApolloLink,
  DocumentNode,
} from "@apollo/client";

export enum Mode {
  Comfort = "comfort",
  Boost = "boost",
  Sleep = "sleep",
  Absence = "absence",
  Frost = "frost",
  DisableHeating = "disableHeating",
  Passive = "passive",
  Summer = "summer",
  Bypass = "bypass",
}

export interface Modes {
  comfort: boolean;
  boost: boolean;
  sleep: boolean;
  absence: boolean;
  frost: boolean;
  disableHeating: boolean;
  passive: boolean;
  summer: boolean;
  bypass: boolean;
}

export interface Room {
  id: string;
  name: string;
  color: string;
  currentTemperatureDegrees: number;
  targetTemperatureDegrees: number;
  mode: Mode | null;
  humidity: number;
}

export interface ModeAndRooms {
  mode: Mode | null;
  rooms: Room[];
}

export interface AuthConfig {
  username: string;
  password: string;
}

type TikoLoginResponse = {
  logIn: {
    token: string;
    user: {
      properties: [
        {
          id: number;
        }
      ];
    };
  };
};

interface TikoModesTemperatures {
  sleep: number;
  absence: number;
  comfort: number;
  frost: number;
}

interface TikoRoomStatus {
  disconnected: boolean;
  heaterDisconnected: boolean;
  heatingOperating: boolean;
  sensorBatteryLow: boolean;
  sensorDisconnected: boolean;
  temporaryAdjustment: boolean;
}

interface TikoDevice {
  name: string;
}

interface TikoRoom {
  id: number;
  name: string;
  type: number;
  color: string;
  heaters: number;
  hasTemperatureSchedule: boolean;
  currentTemperatureDegrees: number;
  targetTemperatureDegrees: number;
  humidity: number;
  sensors: number;
  mode: Modes;
  modesTemperatures: TikoModesTemperatures;
  status: TikoRoomStatus;
  devices: TikoDevice[];
}

interface TikoPropertyMode {
  boost: boolean;
  frost: boolean;
  absence: boolean;
  comfort: boolean;
  disableHeating: boolean;
  sleep: boolean;
  passive: boolean;
  summer: boolean;
  bypass: boolean;
}

interface TikoProperty {
  id: number;
  mode: TikoPropertyMode;
  mboxDisconnected: boolean;
  rooms: TikoRoom[];
}

interface TikoPropertyModeAndRoomsResponse {
  property: TikoProperty;
}

class TikoService {
  private token: string | null = null;
  private baseURL = "https://particuliers-tiko.fr";
  private propertyId: number | null = null;
  private isFetchingToken = false;
  private apolloClient: ApolloClient | null = null;
  private cookies: string[] = [];

  private getApolloClient(): ApolloClient {
    if (!this.apolloClient) {
      this.apolloClient = new ApolloClient({
        cache: new InMemoryCache(),
        link: this.createApolloLink(),
        defaultOptions: {
          query: {
            fetchPolicy: "no-cache",
          },
          watchQuery: {
            fetchPolicy: "no-cache",
          },
        },
      });
    }
    return this.apolloClient;
  }

  private createApolloLink(): ApolloLink {
    const httpLink = new HttpLink({
      uri: `${this.baseURL}/api/v3/graphql/`,
      credentials: "include",
      fetchOptions: {
        mode: "cors",
      },
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      fetch: (uri, options) => {
        return fetch(uri, options).then((response) => {
          // Capture cookies from response (server-side)
          const setCookie = response.headers.get("set-cookie");
          if (setCookie) {
            // In Node.js, set-cookie can contain multiple cookies
            const newCookies = setCookie.split(", ").map((cookie) => {
              // Extract just the cookie name=value part before the first semicolon
              return cookie.split(";")[0];
            });
            // Merge with existing cookies, replacing duplicates
            newCookies.forEach((newCookie) => {
              const cookieName = newCookie.split("=")[0];
              // Remove old cookie with same name
              this.cookies = this.cookies.filter(
                (c) => !c.startsWith(cookieName + "=")
              );
              // Add new cookie
              this.cookies.push(newCookie);
            });
          }
          return response;
        });
      },
    });

    const authLink = new ApolloLink((operation, forward) => {
      operation.setContext(({ headers = {} }) => {
        const newHeaders: Record<string, string> = {
          ...headers,
        };

        // Add authorization token if available
        if (this.token) {
          newHeaders.authorization = `Token ${this.token}`;
        }

        // Add cookies if available (server-side)
        if (this.cookies.length > 0) {
          newHeaders.cookie = this.cookies.join("; ");
        }

        return {
          headers: newHeaders,
        };
      });
      return forward(operation);
    });

    return authLink.concat(httpLink);
  }

  private async request(
    actionName: "query" | "mutate",
    query: DocumentNode,
    variables: object,
    fetchPolicy: "no-cache" | undefined = undefined
  ): Promise<unknown> {
    const client = this.getApolloClient();

    if (actionName === "query") {
      return (
        await client.query({
          query: query,
          variables: variables,
          fetchPolicy,
        })
      ).data;
    }
    if (actionName === "mutate") {
      return (
        await client.mutate({
          mutation: query,
          variables: variables,
        })
      ).data;
    }
  }

  public async auth(reAuth?: boolean) {
    // Token is already defined
    if (!reAuth && this.token) {
      return this.token;
    }

    const email = process.env.TIKO_USERNAME;
    const password = process.env.TIKO_PASSWORD;

    if (!email || !password) {
      throw new Error("E-mail and password are required");
    }

    // Already fetching token: wait for process to end then return token
    if (this.isFetchingToken) {
      await new Promise<void>((resolve) => {
        const fetchInterval = setInterval(() => {
          if (!this.isFetchingToken) {
            clearInterval(fetchInterval);
            resolve();
          }
        }, 10);
      });
      return this.token;
    }

    // Clear token, property ID, cookies, and Apollo client
    this.token = null;
    this.propertyId = null;
    this.cookies = [];
    this.apolloClient = null; // Force recreation with new cookies

    // Fetching Tiko token
    this.isFetchingToken = true;
    const langCode = "en";

    const query = gql`
      mutation LogIn(
        $email: String!
        $password: String!
        $langCode: String
        $retainSession: Boolean
      ) {
        logIn(
          input: {
            email: $email
            password: $password
            langCode: $langCode
            retainSession: $retainSession
          }
        ) {
          user {
            id
            properties {
              id
            }
          }
          token
        }
      }
    `;

    const variables = {
      email,
      password,
      langCode,
      retainSession: true,
    };

    try {
      const data = (await this.request(
        "mutate",
        query,
        variables
      )) as TikoLoginResponse;
      this.token = data.logIn.token;
      this.propertyId = data.logIn.user.properties[0].id;
      this.isFetchingToken = false;

      return this.token;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      const status =
        error && error.errors && error.errors[0] && error.errors[0].status;
      console.error(
        "Failed to authenticate on Tiko backend",
        status,
        error && error.errors
      );
      this.isFetchingToken = false;
      throw error;
    }
  }

  public async getPropertyId() {
    await this.auth();
    return this.propertyId;
  }

  public async callApi(
    actionName: "query" | "mutate",
    query: DocumentNode,
    variables: object,
    fetchPolicy: "no-cache" | undefined = undefined
  ): Promise<unknown> {
    const tryAuthedRequest = async (reAuth?: boolean) => {
      await this.auth(reAuth);
      return await this.request(actionName, query, variables, fetchPolicy);
    };

    try {
      return await tryAuthedRequest();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      const status =
        error && error.errors && error.errors[0] && error.errors[0].status;
      console.error("callApi", actionName, status, error && error.errors);
      if (status === "PERMISSION_DENIED") {
        return await tryAuthedRequest(true);
      }
      throw error;
    }
  }

  async getModeAndRooms(): Promise<ModeAndRooms> {
    try {
      const propertyId = await this.getPropertyId();

      const query = gql`
        query GET_PROPERTY_MODE_AND_ROOMS($id: Int!, $excludeRooms: [Int]) {
          property(id: $id) {
            id
            mode
            mboxDisconnected
            rooms(excludeRooms: $excludeRooms) {
              id
              name
              type
              color
              heaters
              hasTemperatureSchedule
              currentTemperatureDegrees
              targetTemperatureDegrees
              humidity
              sensors
              mode {
                comfort
                boost
                sleep
                absence
                frost
                disableHeating
                passive
                summer
                bypass
              }
              modesTemperatures {
                sleep
                absence
                comfort
                frost
              }
              devices {
                name
              }
              ...Status
            }
          }
        }
        fragment Status on RoomType {
          status {
            disconnected
            heaterDisconnected
            heatingOperating
            sensorBatteryLow
            sensorDisconnected
            temporaryAdjustment
          }
        }
      `;

      const data = (await this.callApi("query", query, {
        id: propertyId,
      })) as TikoPropertyModeAndRoomsResponse;

      const rooms = data?.property?.rooms || [];

      const getMode = (modeObj: Modes): Mode | null =>
        modeObj
          ? (Object.entries(modeObj).find(
              ([key, enabled]) => key !== "__typename" && enabled
            )?.[0] as Mode)
          : null;

      return {
        mode: getMode(data?.property?.mode),
        rooms: rooms.map((room) => ({
          id: room.id.toString(),
          name: room?.devices?.[0]?.name || room.name, // Prefer device name since it can be customized
          color: room.color || "#bb86fc",
          currentTemperatureDegrees: room.currentTemperatureDegrees || 0,
          targetTemperatureDegrees: room.targetTemperatureDegrees || 0,
          mode: getMode(room.mode),
          humidity: room.humidity || 0,
        })),
      };
    } catch (error) {
      console.error("Failed to get heaters:", error);
      return { mode: null, rooms: [] };
    }
  }

  async setMode(mode: Mode | null): Promise<boolean> {
    try {
      const propertyId = await this.getPropertyId();
      const mutation = gql`
        mutation ACTIVATE_HOUSE_MODE(
          $propertyId: Int!
          $mode: String!
          $endDatetime: DateTime
        ) {
          activateHouseMode(
            input: {
              propertyId: $propertyId
              mode: $mode
              endDatetime: $endDatetime
            }
          ) {
            mode {
              comfort
              absence
              frost
              disableHeating
              passive
              bypass
            }
          }
        }
      `;

      await this.callApi("mutate", mutation, {
        propertyId,
        mode: mode || "false",
      });
      return true;
    } catch (error) {
      console.error("Failed to set global mode:", error);
      return false;
    }
  }

  async setRoomMode(roomId: number, mode: Mode | null): Promise<boolean> {
    try {
      const propertyId = await this.getPropertyId();
      const mutation = gql`
        mutation ACTIVATE_ROOM_MODE(
          $propertyId: Int!
          $roomId: Int!
          $mode: String
          $endDatetime: DateTime
        ) {
          activateRoomMode(
            input: {
              propertyId: $propertyId
              roomId: $roomId
              mode: $mode
              endDatetime: $endDatetime
            }
          ) {
            id
            mode {
              comfort
              absence
              sleep
              boost
              frost
              disableHeating
              passive
              summer
              bypass
            }
            modesTemperatures {
              sleep
              absence
              comfort
              frost
            }
          }
        }
      `;
      await this.callApi("mutate", mutation, {
        propertyId,
        roomId,
        ...(mode ? { mode } : {}),
      });
      return true;
    } catch (error) {
      console.error("Failed to set room mode:", error);
      return false;
    }
  }

  async setRoomTemperature(
    roomId: number,
    temperature: number
  ): Promise<boolean> {
    try {
      const propertyId = await this.getPropertyId();
      const mutation = gql`
        mutation SET_PROPERTY_ROOM_ADJUST_TEMPERATURE(
          $propertyId: Int!
          $roomId: Int!
          $temperature: Float!
        ) {
          setRoomAdjustTemperature(
            input: {
              propertyId: $propertyId
              roomId: $roomId
              temperature: $temperature
            }
          ) {
            id
            adjustTemperature {
              active
              endDateTime
              temperature
            }
          }
        }
      `;
      await this.callApi("mutate", mutation, {
        propertyId,
        roomId,
        temperature,
      });
      return true;
    } catch (error) {
      console.error("Failed to set room temperature:", error);
      return false;
    }
  }
}

export const tikoService = new TikoService();
