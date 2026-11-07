export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      admins: {
        Row: {
          created_at: string
          usuario_id: string
        }
        Insert: {
          created_at?: string
          usuario_id: string
        }
        Update: {
          created_at?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "admins_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: true
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      cupones: {
        Row: {
          codigo: string
          descuento_aplicable: string
          estado: string
          fecha_generacion: string | null
          fecha_uso: string | null
          fecha_vencimiento: string | null
          id: string
          lugar_id: string | null
          monto_compra: number | null
          origen: string
          usuario_id: string | null
        }
        Insert: {
          codigo: string
          descuento_aplicable: string
          estado?: string
          fecha_generacion?: string | null
          fecha_uso?: string | null
          fecha_vencimiento?: string | null
          id?: string
          lugar_id?: string | null
          monto_compra?: number | null
          origen?: string
          usuario_id?: string | null
        }
        Update: {
          codigo?: string
          descuento_aplicable?: string
          estado?: string
          fecha_generacion?: string | null
          fecha_uso?: string | null
          fecha_vencimiento?: string | null
          id?: string
          lugar_id?: string | null
          monto_compra?: number | null
          origen?: string
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cupones_lugar_id_fkey"
            columns: ["lugar_id"]
            isOneToOne: false
            referencedRelation: "lugares"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cupones_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      lugares: {
        Row: {
          activo: boolean
          barrio: string
          comision_pct: number
          created_at: string | null
          direccion: string
          fotos: string[] | null
          horarios: string | null
          id: string
          nivel_ruido: string | null
          nombre: string
          productos_destacados: string | null
          rango_precios: string | null
          resena_curada: string | null
          tiene_enchufes: boolean | null
          tipo: string
          ultima_verificacion: string | null
          wifi_score: number | null
        }
        Insert: {
          activo?: boolean
          barrio: string
          comision_pct?: number
          created_at?: string | null
          direccion: string
          fotos?: string[] | null
          horarios?: string | null
          id?: string
          nivel_ruido?: string | null
          nombre: string
          productos_destacados?: string | null
          rango_precios?: string | null
          resena_curada?: string | null
          tiene_enchufes?: boolean | null
          tipo: string
          ultima_verificacion?: string | null
          wifi_score?: number | null
        }
        Update: {
          activo?: boolean
          barrio?: string
          comision_pct?: number
          created_at?: string | null
          direccion?: string
          fotos?: string[] | null
          horarios?: string | null
          id?: string
          nivel_ruido?: string | null
          nombre?: string
          productos_destacados?: string | null
          rango_precios?: string | null
          resena_curada?: string | null
          tiene_enchufes?: boolean | null
          tipo?: string
          ultima_verificacion?: string | null
          wifi_score?: number | null
        }
        Relationships: []
      }
      lugares_guardados: {
        Row: {
          created_at: string | null
          lugar_id: string
          usuario_id: string
        }
        Insert: {
          created_at?: string | null
          lugar_id: string
          usuario_id: string
        }
        Update: {
          created_at?: string | null
          lugar_id?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lugares_guardados_lugar_id_fkey"
            columns: ["lugar_id"]
            isOneToOne: false
            referencedRelation: "lugares"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lugares_guardados_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      usuarios: {
        Row: {
          email: string
          fecha_alta: string | null
          id: string
          nombre: string
        }
        Insert: {
          email: string
          fecha_alta?: string | null
          id: string
          nombre: string
        }
        Update: {
          email?: string
          fecha_alta?: string | null
          id?: string
          nombre?: string
        }
        Relationships: []
      }
    }
    Views: {
      v_cupones_admin: {
        Row: {
          barrio: string | null
          codigo: string | null
          comision: number | null
          comision_pct: number | null
          descuento_aplicable: string | null
          estado: string | null
          estado_efectivo: string | null
          fecha_generacion: string | null
          fecha_uso: string | null
          fecha_vencimiento: string | null
          id: string | null
          lugar_id: string | null
          lugar_nombre: string | null
          monto_compra: number | null
          origen: string | null
          usuario_email: string | null
          usuario_id: string | null
          usuario_nombre: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cupones_lugar_id_fkey"
            columns: ["lugar_id"]
            isOneToOne: false
            referencedRelation: "lugares"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cupones_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      canjear_cupon: {
        Args: { p_codigo: string; p_monto: number }
        Returns: {
          codigo: string
          descuento_aplicable: string
          estado: string
          fecha_generacion: string | null
          fecha_uso: string | null
          fecha_vencimiento: string | null
          id: string
          lugar_id: string | null
          monto_compra: number | null
          origen: string
          usuario_id: string | null
        }
        SetofOptions: {
          from: "*"
          to: "cupones"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      es_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
