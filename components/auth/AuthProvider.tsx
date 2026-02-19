'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';

interface AuthContextType {
  user: any;
  loading: boolean;
}

var AuthContext = createContext<AuthContextType>({ user: null, loading: true });

export function useAuth() {
  return useContext(AuthContext);
}

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  var [user, setUser] = useState<any>(null);
  var [loading, setLoading] = useState(true);

  useEffect(function() {
    supabase.auth.getUser().then(function({ data: { user } }) {
      setUser(user);
      setLoading(false);
    });

    var { data: { subscription } } = supabase.auth.onAuthStateChange(function(event, session) {
      setUser(session?.user || null);
      setLoading(false);
    });

    return function() {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user: user, loading: loading }}>
      {children}
    </AuthContext.Provider>
  );
}
