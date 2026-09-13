const SUPABASE_URL = 'https://vymucczvgyvhhhhynyrl.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_oZ8ExxArDVLYePBTXslCqQ_X8LvyfS3';

if (!window.supabase) {
  throw new Error('Supabase JavaScript 라이브러리가 로드되지 않았습니다.');
}

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  }
);

const DB = {
  async addParticipant(p) {
    const row = {
      id: p.id,
      name: p.name.trim(),
      gender: p.gender,
      age_group: p.ageGroup,
      sido: p.sido.trim(),
      sigungu: p.sigungu.trim(),
      consent_privacy: p.consentPrivacy,
      consent_third_party: p.consentThirdParty,
      consent_portrait: p.consentPortrait
    };

    const { error } = await supabaseClient
      .from('participants')
      .insert(row);

    if (error) throw error;
    return row;
  },

  async findParticipant(id) {
    const { data, error } = await supabaseClient
      .from('participants')
      .select('id,name,gender,age_group,sido,sigungu,checked_in,checked_in_at')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async checkIn(id) {
    const { data, error } = await supabaseClient
      .from('participants')
      .update({
        checked_in: true,
        checked_in_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('checked_in', false)
      .select('id,name,checked_in,checked_in_at')
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async getParticipants() {
    const { data, error } = await supabaseClient
      .from('participants')
      .select('id,name,gender,age_group,sido,sigungu,created_at,checked_in,checked_in_at')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async signIn(email, password) {
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email,
      password
    });
    if (error) throw error;
    return data;
  },

  async signOut() {
    const { error } = await supabaseClient.auth.signOut();
    if (error) throw error;
  },

  async getSession() {
    const { data, error } = await supabaseClient.auth.getSession();
    if (error) throw error;
    return data.session;
  },

  async getCurrentUserRole() {
    const session = await this.getSession();
    if (!session) return null;

    const { data, error } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', session.user.id)
      .maybeSingle();

    if (error) throw error;
    return data ? data.role : null;
  },

  async requireRole(allowedRoles) {
    const session = await this.getSession();
    if (!session) {
      location.replace('login.html');
      return null;
    }

    const role = await this.getCurrentUserRole();
    if (!role || !allowedRoles.includes(role)) {
      alert('이 페이지에 접근할 권한이 없습니다.');
      location.replace('login.html');
      return null;
    }
    return { session, role };
  }
};
