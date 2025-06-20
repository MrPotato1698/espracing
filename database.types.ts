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
          champ_img: string | null
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
          champ_img?: string | null
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
          champ_img?: string | null
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
      championshipcars: {
        Row: {
          car: number
          championship: number
        }
        Insert: {
          car: number
          championship: number
        }
        Update: {
          car?: number
          championship?: number
        }
        Relationships: [
          {
            foreignKeyName: "championshipcars_car_fkey"
            columns: ["car"]
            isOneToOne: false
            referencedRelation: "car"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "championshipcars_championship_fkey"
            columns: ["championship"]
            isOneToOne: false
            referencedRelation: "championship"
            referencedColumns: ["id"]
          },
        ]
      }
      champwinners: {
        Row: {
          car_name: number | null
          category: number | null
          championship: number
          id: number
          isTeam: boolean
          winner: string
        }
        Insert: {
          car_name?: number | null
          category?: number | null
          championship: number
          id?: number
          isTeam?: boolean
          winner: string
        }
        Update: {
          car_name?: number | null
          category?: number | null
          championship?: number
          id?: number
          isTeam?: boolean
          winner?: string
        }
        Relationships: [
          {
            foreignKeyName: "champwinners_car_name_fkey"
            columns: ["car_name"]
            isOneToOne: false
            referencedRelation: "car"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "champwinners_category_fkey"
            columns: ["category"]
            isOneToOne: false
            referencedRelation: "carclass"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "champwinners_championship_fkey"
            columns: ["championship"]
            isOneToOne: false
            referencedRelation: "championship"
            referencedColumns: ["id"]
          },
        ]
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
      cron_logs: {
        Row: {
          created_at: string | null
          function_name: string | null
          id: number
          result: string | null
        }
        Insert: {
          created_at?: string | null
          function_name?: string | null
          id?: number
          result?: string | null
        }
        Update: {
          created_at?: string | null
          function_name?: string | null
          id?: number
          result?: string | null
        }
        Relationships: []
      }
      global_adjust: {
        Row: {
          key: string
          name: string | null
          value: string
        }
        Insert: {
          key?: string
          name?: string | null
          value?: string
        }
        Update: {
          key?: string
          name?: string | null
          value?: string
        }
        Relationships: []
      }
      inscription: {
        Row: {
          car: number
          id: number
          position: number
          profile: string | null
          race: string | null
          valid_laps: number | null
        }
        Insert: {
          car?: number
          id: number
          position?: number
          profile?: string | null
          race?: string | null
          valid_laps?: number | null
        }
        Update: {
          car?: number
          id?: number
          position?: number
          profile?: string | null
          race?: string | null
          valid_laps?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "inscription_car_fkey"
            columns: ["car"]
            isOneToOne: false
            referencedRelation: "car"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inscription_profile_fkey"
            columns: ["profile"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      inscriptionscalendar: {
        Row: {
          championship: number | null
          id: number
          inscriptions_close: string
          inscriptions_open: string
          inscriptions_times_register: Json | null
          is_open: boolean
          name: string
          order: number
          url_time: string
        }
        Insert: {
          championship?: number | null
          id?: number
          inscriptions_close?: string
          inscriptions_open?: string
          inscriptions_times_register?: Json | null
          is_open?: boolean
          name: string
          order?: number
          url_time?: string
        }
        Update: {
          championship?: number | null
          id?: number
          inscriptions_close?: string
          inscriptions_open?: string
          inscriptions_times_register?: Json | null
          is_open?: boolean
          name?: string
          order?: number
          url_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "inscriptionscalendar_championship_fkey"
            columns: ["championship"]
            isOneToOne: false
            referencedRelation: "championship"
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
          podiums: number
          poles: number
          races: number
          roleesp: number | null
          steam_id: string | null
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
          podiums?: number
          poles?: number
          races?: number
          roleesp?: number | null
          steam_id?: string | null
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
          podiums?: number
          poles?: number
          races?: number
          roleesp?: number | null
          steam_id?: string | null
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
          race_date: string
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
          race_date?: string
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
          race_date?: string
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
      racenotecode: {
        Row: {
          id: number
          name: string
        }
        Insert: {
          id?: number
          name: string
        }
        Update: {
          id?: number
          name?: string
        }
        Relationships: []
      }
      racenotes: {
        Row: {
          code: number
          description: string | null
          id: number
          penalty: string | null
          race: number
        }
        Insert: {
          code?: number
          description?: string | null
          id?: number
          penalty?: string | null
          race: number
        }
        Update: {
          code?: number
          description?: string | null
          id?: number
          penalty?: string | null
          race?: number
        }
        Relationships: [
          {
            foreignKeyName: "racenotes_code_fkey"
            columns: ["code"]
            isOneToOne: false
            referencedRelation: "racenotecode"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "racenotes_race_fkey"
            columns: ["race"]
            isOneToOne: false
            referencedRelation: "race"
            referencedColumns: ["id"]
          },
        ]
      }
      racerules: {
        Row: {
          championship: number
          content: string | null
          created_at: string | null
          id: number
          isVisible: boolean
          updated_at: string | null
          updated_by: string
        }
        Insert: {
          championship?: number
          content?: string | null
          created_at?: string | null
          id?: number
          isVisible?: boolean
          updated_at?: string | null
          updated_by: string
        }
        Update: {
          championship?: number
          content?: string | null
          created_at?: string | null
          id?: number
          isVisible?: boolean
          updated_at?: string | null
          updated_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "racerules_championship_fkey"
            columns: ["championship"]
            isOneToOne: false
            referencedRelation: "championship"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "racerules_updated_by_fkey1"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      racerulesimg: {
        Row: {
          id: number
          img_url: string
          name: string
        }
        Insert: {
          id?: number
          img_url?: string
          name?: string
        }
        Update: {
          id?: number
          img_url?: string
          name?: string
        }
        Relationships: []
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
          image: string
          name: string
        }
        Insert: {
          active?: boolean | null
          description?: string | null
          id: number
          image?: string
          name?: string
        }
        Update: {
          active?: boolean | null
          description?: string | null
          id?: number
          image?: string
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
      fetch_inscriptions_table: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_car_brands_with_model_count: {
        Args: Record<PropertyKey, never>
        Returns: {
          brand_id: number
          brand_name: string
          brand_img: string
          brand_location: string
          brand_foundation: number
          model_count: number
        }[]
      }
      get_car_classes_with_model_count: {
        Args: Record<PropertyKey, never>
        Returns: {
          class_id: number
          class_name: string
          class_shortname: string
          class_design: string
          model_count: number
        }[]
      }
      get_championship_data: {
        Args: { champ_id: number }
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
