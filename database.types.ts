export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      car: {
        Row: {
          brand: number | null
          class: number
          description: string | null
          filename: string
          fuelLiterTime: number | null
          id: number
          maxLiter: number | null
          model: string | null
          power: number | null
          torque: number | null
          tyreTimeChange: number | null
          weight: number | null
          year: number | null
        }
        Insert: {
          brand?: number | null
          class?: number
          description?: string | null
          filename: string
          fuelLiterTime?: number | null
          id: number
          maxLiter?: number | null
          model?: string | null
          power?: number | null
          torque?: number | null
          tyreTimeChange?: number | null
          weight?: number | null
          year?: number | null
        }
        Update: {
          brand?: number | null
          class?: number
          description?: string | null
          filename?: string
          fuelLiterTime?: number | null
          id?: number
          maxLiter?: number | null
          model?: string | null
          power?: number | null
          torque?: number | null
          tyreTimeChange?: number | null
          weight?: number | null
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "car_brand_fkey"
            columns: ["brand"]
            isOneToOne: false
            referencedRelation: "carbrand"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "car_class_fkey"
            columns: ["class"]
            isOneToOne: false
            referencedRelation: "carclass"
            referencedColumns: ["id"]
          },
        ]
      }
      carbrand: {
        Row: {
          foundation: number | null
          id: number
          imgbrand: string | null
          location: string | null
          name: string | null
        }
        Insert: {
          foundation?: number | null
          id?: number
          imgbrand?: string | null
          location?: string | null
          name?: string | null
        }
        Update: {
          foundation?: number | null
          id?: number
          imgbrand?: string | null
          location?: string | null
          name?: string | null
        }
        Relationships: []
      }
      carclass: {
        Row: {
          class_design: string | null
          id: number
          name: string | null
          short_name: string | null
        }
        Insert: {
          class_design?: string | null
          id?: number
          name?: string | null
          short_name?: string | null
        }
        Update: {
          class_design?: string | null
          id?: number
          name?: string | null
          short_name?: string | null
        }
        Relationships: []
      }
      championship: {
        Row: {
          id: number
          ischampionship: boolean | null
          isfinished: boolean
          key_search: string | null
          name: string | null
          number_of_races_total: number
          season: string | null
          year: number
        }
        Insert: {
          id: number
          ischampionship?: boolean | null
          isfinished?: boolean
          key_search?: string | null
          name?: string | null
          number_of_races_total?: number
          season?: string | null
          year?: number
        }
        Update: {
          id?: number
          ischampionship?: boolean | null
          isfinished?: boolean
          key_search?: string | null
          name?: string | null
          number_of_races_total?: number
          season?: string | null
          year?: number
        }
        Relationships: []
      }
      circuit: {
        Row: {
          filename: string
          id: number
          location: string | null
          name: string | null
          shortname: string | null
        }
        Insert: {
          filename: string
          id: number
          location?: string | null
          name?: string | null
          shortname?: string | null
        }
        Update: {
          filename?: string
          id?: number
          location?: string | null
          name?: string | null
          shortname?: string | null
        }
        Relationships: []
      }
      circuitLayout: {
        Row: {
          capacity: number | null
          circuit: number
          filename: string
          id: number
          length: number | null
          name: string | null
        }
        Insert: {
          capacity?: number | null
          circuit: number
          filename: string
          id: number
          length?: number | null
          name?: string | null
        }
        Update: {
          capacity?: number | null
          circuit?: number
          filename?: string
          id?: number
          length?: number | null
          name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "CircuitLayout_circuit_fkey"
            columns: ["circuit"]
            isOneToOne: false
            referencedRelation: "circuit"
            referencedColumns: ["id"]
          },
        ]
      }
      inscription: {
        Row: {
          id: number
          position: number
          profile: string | null
          race: string | null
          valid_laps: string | null
        }
        Insert: {
          id: number
          position?: number
          profile?: string | null
          race?: string | null
          valid_laps?: string | null
        }
        Update: {
          id?: number
          position?: number
          profile?: string | null
          race?: string | null
          valid_laps?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inscription_profile_fkey"
            columns: ["profile"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      message: {
        Row: {
          description: string | null
          discord: string
          id: number
          name_emissor: string
          name_receiver: string
          readed: boolean | null
          region: string | null
        }
        Insert: {
          description?: string | null
          discord: string
          id: number
          name_emissor: string
          name_receiver?: string
          readed?: boolean | null
          region?: string | null
        }
        Update: {
          description?: string | null
          discord?: string
          id?: number
          name_emissor?: string
          name_receiver?: string
          readed?: boolean | null
          region?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "message_name_receiver_fkey"
            columns: ["name_receiver"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pointsystem: {
        Row: {
          fastestlap: number
          id: number
          name: string
          points: string
        }
        Insert: {
          fastestlap?: number
          id?: number
          name: string
          points?: string
        }
        Update: {
          fastestlap?: number
          id?: number
          name?: string
          points?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar: string
          dnf: number
          email: string
          flaps: number
          full_name: string | null
          id: string
          is_team_manager: boolean | null
          last_modified: string | null
          number_plate: number | null
          podiums: number
          poles: number
          races: number
          roleesp: number | null
          steam_id: string
          team: number | null
          top10: number
          top5: number
          wins: number
        }
        Insert: {
          avatar?: string
          dnf?: number
          email: string
          flaps?: number
          full_name?: string | null
          id: string
          is_team_manager?: boolean | null
          last_modified?: string | null
          number_plate?: number | null
          podiums?: number
          poles?: number
          races?: number
          roleesp?: number | null
          steam_id: string
          team?: number | null
          top10?: number
          top5?: number
          wins?: number
        }
        Update: {
          avatar?: string
          dnf?: number
          email?: string
          flaps?: number
          full_name?: string | null
          id?: string
          is_team_manager?: boolean | null
          last_modified?: string | null
          number_plate?: number | null
          podiums?: number
          poles?: number
          races?: number
          roleesp?: number | null
          steam_id?: string
          team?: number | null
          top10?: number
          top5?: number
          wins?: number
        }
        Relationships: [
          {
            foreignKeyName: "profiles_roleesp_fkey"
            columns: ["roleesp"]
            isOneToOne: false
            referencedRelation: "role"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_team_fkey"
            columns: ["team"]
            isOneToOne: false
            referencedRelation: "team"
            referencedColumns: ["id"]
          },
        ]
      }
      race: {
        Row: {
          championship: number
          filename: string
          id: number
          name: string | null
          orderinchamp: number
          pointsystem: number
          race_data_1: string
          race_data_2: string | null
          splits: number
        }
        Insert: {
          championship?: number
          filename: string
          id: number
          name?: string | null
          orderinchamp?: number
          pointsystem?: number
          race_data_1: string
          race_data_2?: string | null
          splits?: number
        }
        Update: {
          championship?: number
          filename?: string
          id?: number
          name?: string | null
          orderinchamp?: number
          pointsystem?: number
          race_data_1?: string
          race_data_2?: string | null
          splits?: number
        }
        Relationships: [
          {
            foreignKeyName: "race_championship_fkey"
            columns: ["championship"]
            isOneToOne: false
            referencedRelation: "championship"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "race_pointsystem_fkey"
            columns: ["pointsystem"]
            isOneToOne: false
            referencedRelation: "pointsystem"
            referencedColumns: ["id"]
          },
        ]
      }
      racenotes: {
        Row: {
          code: number
          description: string | null
          id: number
          race: number
        }
        Insert: {
          code?: number
          description?: string | null
          id?: number
          race: number
        }
        Update: {
          code?: number
          description?: string | null
          id?: number
          race?: number
        }
        Relationships: [
          {
            foreignKeyName: "racenotes_race_fkey"
            columns: ["race"]
            isOneToOne: false
            referencedRelation: "race"
            referencedColumns: ["id"]
          },
        ]
      }
      role: {
        Row: {
          id: number
          name: string | null
        }
        Insert: {
          id?: number
          name?: string | null
        }
        Update: {
          id?: number
          name?: string | null
        }
        Relationships: []
      }
      team: {
        Row: {
          active: boolean | null
          description: string | null
          id: number
          image: string | null
          name: string
        }
        Insert: {
          active?: boolean | null
          description?: string | null
          id: number
          image?: string | null
          name?: string
        }
        Update: {
          active?: boolean | null
          description?: string | null
          id?: number
          image?: string | null
          name?: string
        }
        Relationships: []
      }
      teamsapplication: {
        Row: {
          id: number
          team_manager: string
          team_requesting: number
          type: string | null
          user_application: string
        }
        Insert: {
          id?: number
          team_manager?: string
          team_requesting: number
          type?: string | null
          user_application?: string
        }
        Update: {
          id?: number
          team_manager?: string
          team_requesting?: number
          type?: string | null
          user_application?: string
        }
        Relationships: [
          {
            foreignKeyName: "teamsapplication_team_manager_fkey"
            columns: ["team_manager"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teamsapplication_team_requesting_fkey"
            columns: ["team_requesting"]
            isOneToOne: false
            referencedRelation: "team"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teamsapplication_user_application_fkey"
            columns: ["user_application"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_championship_data: {
        Args: {
          champ_id: number
        }
        Returns: {
          championship_id: number
          name: string
          year: number
          season: string
          isfinished: boolean
          champcancel: boolean
        }[]
      }
      get_championship_list: {
        Args: Record<PropertyKey, never>
        Returns: {
          championship_id: number
          name: string
          season: string
          champcancel: boolean
        }[]
      }
      get_circuit_layouts_count: {
        Args: Record<PropertyKey, never>
        Returns: {
          circuit_id: number
          circuit_name: string
          circuit_location: string
          layouts_count: number
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
