export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      car: {
        Row: {
          brand: string | null
          class: string | null
          description: string | null
          filename: string | null
          id: number
          imgbrand: string | null
          model: string | null
          power: number | null
          torque: number | null
          weight: number | null
          year: number | null
        }
        Insert: {
          brand?: string | null
          class?: string | null
          description?: string | null
          filename?: string | null
          id: number
          imgbrand?: string | null
          model?: string | null
          power?: number | null
          torque?: number | null
          weight?: number | null
          year?: number | null
        }
        Update: {
          brand?: string | null
          class?: string | null
          description?: string | null
          filename?: string | null
          id?: number
          imgbrand?: string | null
          model?: string | null
          power?: number | null
          torque?: number | null
          weight?: number | null
          year?: number | null
        }
        Relationships: []
      }
      championship: {
        Row: {
          id: number
          key_search: string | null
          name: string | null
        }
        Insert: {
          id: number
          key_search?: string | null
          name?: string | null
        }
        Update: {
          id?: number
          key_search?: string | null
          name?: string | null
        }
        Relationships: []
      }
      circuit: {
        Row: {
          filename: string | null
          id: number
          location: string | null
          name: string | null
        }
        Insert: {
          filename?: string | null
          id: number
          location?: string | null
          name?: string | null
        }
        Update: {
          filename?: string | null
          id?: number
          location?: string | null
          name?: string | null
        }
        Relationships: []
      }
      circuitLayout: {
        Row: {
          capacity: number | null
          circuit: number
          filename: string | null
          id: number
          length: number | null
          name: string | null
        }
        Insert: {
          capacity?: number | null
          circuit: number
          filename?: string | null
          id: number
          length?: number | null
          name?: string | null
        }
        Update: {
          capacity?: number | null
          circuit?: number
          filename?: string | null
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
          id: string
          position: string | null
          race: string | null
          user: string | null
          valid_laps: string | null
        }
        Insert: {
          id: string
          position?: string | null
          race?: string | null
          user?: string | null
          valid_laps?: string | null
        }
        Update: {
          id?: string
          position?: string | null
          race?: string | null
          user?: string | null
          valid_laps?: string | null
        }
        Relationships: []
      }
      message: {
        Row: {
          description: string | null
          discord: string | null
          id: string
          name_emissor: string
          name_receiver: string | null
          readed: boolean | null
          region: string | null
        }
        Insert: {
          description?: string | null
          discord?: string | null
          id: string
          name_emissor: string
          name_receiver?: string | null
          readed?: boolean | null
          region?: string | null
        }
        Update: {
          description?: string | null
          discord?: string | null
          id?: string
          name_emissor?: string
          name_receiver?: string | null
          readed?: boolean | null
          region?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar: string | null
          dnf: number | null
          email: string | null
          flaps: number | null
          full_name: string | null
          id: string
          is_team_manager: boolean | null
          podiums: number | null
          poles: number | null
          races: number | null
          roleesp: string | null
          steam_id: string | null
          team: number | null
          top10: number | null
          top5: number | null
          updated_at: string | null
          wins: number | null
        }
        Insert: {
          avatar?: string | null
          dnf?: number | null
          email?: string | null
          flaps?: number | null
          full_name?: string | null
          id: string
          is_team_manager?: boolean | null
          podiums?: number | null
          poles?: number | null
          races?: number | null
          roleesp?: string | null
          steam_id?: string | null
          team?: number | null
          top10?: number | null
          top5?: number | null
          updated_at?: string | null
          wins?: number | null
        }
        Update: {
          avatar?: string | null
          dnf?: number | null
          email?: string | null
          flaps?: number | null
          full_name?: string | null
          id?: string
          is_team_manager?: boolean | null
          podiums?: number | null
          poles?: number | null
          races?: number | null
          roleesp?: string | null
          steam_id?: string | null
          team?: number | null
          top10?: number | null
          top5?: number | null
          updated_at?: string | null
          wins?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      race: {
        Row: {
          championship: number | null
          filename: string
          id: number
          name: string | null
        }
        Insert: {
          championship?: number | null
          filename: string
          id: number
          name?: string | null
        }
        Update: {
          championship?: number | null
          filename?: string
          id?: number
          name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "Race_championship_fkey"
            columns: ["championship"]
            isOneToOne: false
            referencedRelation: "championship"
            referencedColumns: ["id"]
          },
        ]
      }
      team: {
        Row: {
          description: string | null
          id: number
          image: string | null
          name: string
        }
        Insert: {
          description?: string | null
          id: number
          image?: string | null
          name?: string
        }
        Update: {
          description?: string | null
          id?: number
          image?: string | null
          name?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
