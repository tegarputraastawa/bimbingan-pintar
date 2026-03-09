export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      jadwal: {
        Row: {
          created_at: string
          id: string
          jam_mulai: string
          jam_selesai: string
          kelas_id: string
          ruangan: string
          tanggal: string
          tutor_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          jam_mulai: string
          jam_selesai: string
          kelas_id: string
          ruangan: string
          tanggal: string
          tutor_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          jam_mulai?: string
          jam_selesai?: string
          kelas_id?: string
          ruangan?: string
          tanggal?: string
          tutor_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      kelas: {
        Row: {
          aktif: boolean
          created_at: string
          deskripsi: string
          harga: number
          id: string
          nama: string
          updated_at: string
        }
        Insert: {
          aktif?: boolean
          created_at?: string
          deskripsi?: string
          harga: number
          id?: string
          nama: string
          updated_at?: string
        }
        Update: {
          aktif?: boolean
          created_at?: string
          deskripsi?: string
          harga?: number
          id?: string
          nama?: string
          updated_at?: string
        }
        Relationships: []
      }
      laporan_perkembangan: {
        Row: {
          catatan: string
          created_at: string
          id: string
          kehadiran: string
          kelas_id: string
          nilai: number | null
          siswa_id: string
          tanggal: string
          tutor_id: string
          updated_at: string
        }
        Insert: {
          catatan?: string
          created_at?: string
          id?: string
          kehadiran?: string
          kelas_id: string
          nilai?: number | null
          siswa_id: string
          tanggal: string
          tutor_id: string
          updated_at?: string
        }
        Update: {
          catatan?: string
          created_at?: string
          id?: string
          kehadiran?: string
          kelas_id?: string
          nilai?: number | null
          siswa_id?: string
          tanggal?: string
          tutor_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      libur: {
        Row: {
          created_at: string
          id: string
          keterangan: string
          tanggal: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          keterangan: string
          tanggal: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          keterangan?: string
          tanggal?: string
          updated_at?: string
        }
        Relationships: []
      }
      orang_tua: {
        Row: {
          alamat: string
          created_at: string
          email: string
          hubungan: string
          id: string
          nama: string
          siswa_id: string
          telepon: string
          updated_at: string
        }
        Insert: {
          alamat?: string
          created_at?: string
          email?: string
          hubungan?: string
          id?: string
          nama: string
          siswa_id: string
          telepon?: string
          updated_at?: string
        }
        Update: {
          alamat?: string
          created_at?: string
          email?: string
          hubungan?: string
          id?: string
          nama?: string
          siswa_id?: string
          telepon?: string
          updated_at?: string
        }
        Relationships: []
      }
      pembayaran: {
        Row: {
          created_at: string
          id: string
          jumlah: number
          keterangan: string
          metode: string
          periode_akhir: string | null
          periode_mulai: string | null
          siswa_id: string
          status: string
          tanggal: string
          tanggal_jatuh_tempo: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          jumlah: number
          keterangan?: string
          metode: string
          periode_akhir?: string | null
          periode_mulai?: string | null
          siswa_id: string
          status: string
          tanggal?: string
          tanggal_jatuh_tempo?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          jumlah?: number
          keterangan?: string
          metode?: string
          periode_akhir?: string | null
          periode_mulai?: string | null
          siswa_id?: string
          status?: string
          tanggal?: string
          tanggal_jatuh_tempo?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      ruangan: {
        Row: {
          created_at: string
          id: string
          kapasitas: number
          nama: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          kapasitas?: number
          nama: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          kapasitas?: number
          nama?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      siswa: {
        Row: {
          aktif: boolean
          alamat: string
          created_at: string
          email: string
          id: string
          kelas_id: string
          nama: string
          tanggal_akhir: string | null
          tanggal_daftar: string
          tanggal_mulai: string | null
          telepon: string
          updated_at: string
        }
        Insert: {
          aktif?: boolean
          alamat?: string
          created_at?: string
          email?: string
          id?: string
          kelas_id: string
          nama: string
          tanggal_akhir?: string | null
          tanggal_daftar?: string
          tanggal_mulai?: string | null
          telepon: string
          updated_at?: string
        }
        Update: {
          aktif?: boolean
          alamat?: string
          created_at?: string
          email?: string
          id?: string
          kelas_id?: string
          nama?: string
          tanggal_akhir?: string | null
          tanggal_daftar?: string
          tanggal_mulai?: string | null
          telepon?: string
          updated_at?: string
        }
        Relationships: []
      }
      tutor: {
        Row: {
          bidang: string
          created_at: string
          email: string
          foto_url: string | null
          id: string
          nama: string
          telepon: string
          updated_at: string
        }
        Insert: {
          bidang: string
          created_at?: string
          email?: string
          foto_url?: string | null
          id?: string
          nama: string
          telepon: string
          updated_at?: string
        }
        Update: {
          bidang?: string
          created_at?: string
          email?: string
          foto_url?: string | null
          id?: string
          nama?: string
          telepon?: string
          updated_at?: string
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
