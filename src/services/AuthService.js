// =====================================================
// ADMAC - Authentication Service
// =====================================================
// Serviço centralizado para gerenciar autenticação com Supabase Auth
// Inclui fallback automático para localStorage quando offline
// =====================================================

import { supabase, testSupabaseConnection } from './supabaseClient';

class AuthService {
    constructor() {
        this.isOnline = false;
        this.PREFER_LOCAL = true; // Forçar uso do localStorage por padrão
        this.checkConnection();
    }

    // Verifica conexão com Supabase
    async checkConnection() {
        try {
            this.isOnline = await testSupabaseConnection();
            console.log(`🔐 AuthService: ${this.isOnline ? 'Online (Supabase)' : 'Offline (localStorage)'}`);
        } catch (error) {
            console.error('Error checking connection:', error);
            this.isOnline = false;
        }
        return this.isOnline;
    }

    // =====================================================
    // REGISTRO DE USUÁRIO
    // =====================================================
    async register(name, email, password, userType) {
        await this.checkConnection();

        if (this.isOnline) {
            return await this.registerWithSupabase(name, email, password, userType);
        } else {
            return await this.registerWithLocalStorage(name, email, password, userType);
        }
    }

    // Registro com Supabase Auth
    async registerWithSupabase(name, email, password, userType) {
        try {
            // 1. Criar usuário no Supabase Auth
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        name,
                        user_type: userType
                    }
                }
            });

            if (authError) {
                console.error('Supabase Auth Error:', authError);
                
                // Traduzir erros comuns
                if (authError.message.includes('already registered')) {
                    throw new Error('Este e-mail já está cadastrado');
                }
                if (authError.message.includes('invalid email')) {
                    throw new Error('E-mail inválido');
                }
                if (authError.message.includes('password')) {
                    throw new Error('Senha deve ter pelo menos 6 caracteres');
                }
                
                throw new Error(authError.message);
            }

            console.log('✅ Usuário registrado no Supabase Auth:', authData.user?.email);

            // 2. O perfil será criado automaticamente pelo trigger
            // Aguardar um momento para o trigger executar
            await new Promise(resolve => setTimeout(resolve, 500));

            // 3. Verificar se o perfil foi criado
            const { data: profile, error: profileError } = await supabase
                .from('user_profiles')
                .select('*')
                .eq('id', authData.user.id)
                .single();

            if (profileError) {
                console.warn('Profile not found, creating manually:', profileError);
                
                // Criar perfil manualmente se o trigger falhou
                const { error: insertError } = await supabase
                    .from('user_profiles')
                    .insert({
                        id: authData.user.id,
                        name,
                        email,
                        user_type: userType
                    });

                if (insertError) {
                    console.error('Error creating profile:', insertError);
                }
            }

            return {
                success: true,
                user: authData.user,
                message: 'Cadastro realizado com sucesso!'
            };

        } catch (error) {
            console.error('Registration error:', error);
            
            // Fallback para localStorage em caso de erro
            console.log('⚠️ Falling back to localStorage...');
            return await this.registerWithLocalStorage(name, email, password, userType);
        }
    }

    // Registro com localStorage (fallback)
    async registerWithLocalStorage(name, email, password, userType) {
        try {
            const users = JSON.parse(localStorage.getItem('admac_users') || '[]');

            // Verificar se email já existe
            const emailExists = users.some(u => u.email === email);
            if (emailExists) {
                throw new Error('Este e-mail já está cadastrado');
            }

            // Adicionar novo usuário
            const newUser = {
                id: Date.now(),
                name,
                email,
                password, // Em produção, isso deveria ser hash
                userType,
                createdAt: new Date().toISOString()
            };

            users.push(newUser);
            localStorage.setItem('admac_users', JSON.stringify(users));

            console.log('✅ Usuário registrado no localStorage:', email);

            return {
                success: true,
                user: newUser,
                message: 'Cadastro realizado com sucesso! (modo offline)',
                offline: true
            };

        } catch (error) {
            console.error('localStorage registration error:', error);
            throw error;
        }
    }

    // =====================================================
    // LOGIN
    // =====================================================
    async login(email, password) {
        // Tentar primeiro localmente se preferir local ou se estiver offline
        if (this.PREFER_LOCAL) {
            try {
                const result = await this.loginWithLocalStorage(email, password);
                if (result.success) return result;
            } catch (error) {
                // Se falhar no local, tenta Supabase se estiver online e não for erro de senha
                if (!this.isOnline) throw error;
            }
        }

        await this.checkConnection();

        if (this.isOnline) {
            return await this.loginWithSupabase(email, password);
        } else {
            return await this.loginWithLocalStorage(email, password);
        }
    }

    // Login com Supabase Auth
    async loginWithSupabase(email, password) {
        try {
            // 1. Autenticar com Supabase Auth
            const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (authError) {
                console.error('Supabase Auth Error:', authError);
                
                // Traduzir erros comuns
                if (authError.message.includes('Invalid login credentials')) {
                    throw new Error('E-mail ou senha incorretos');
                }
                
                throw new Error(authError.message);
            }

            // 2. Buscar perfil do usuário
            const { data: profile, error: profileError } = await supabase
                .from('user_profiles')
                .select('*')
                .eq('id', authData.user.id)
                .single();

            if (profileError) {
                console.error('Error fetching profile:', profileError);
                // Continuar mesmo sem perfil
            }

            const userData = {
                id: authData.user.id,
                email: authData.user.email,
                name: profile?.name || authData.user.user_metadata?.name || 'Usuário',
                userType: profile?.user_type || authData.user.user_metadata?.user_type || 'membro'
            };

            // 3. Salvar no localStorage para acesso rápido
            localStorage.setItem('isAuthenticated', 'true');
            localStorage.setItem('user', JSON.stringify(userData));

            console.log('✅ Login realizado com Supabase:', email);

            return {
                success: true,
                user: userData
            };

        } catch (error) {
            console.error('Login error:', error);
            
            // Fallback para localStorage
            console.log('⚠️ Falling back to localStorage...');
            return await this.loginWithLocalStorage(email, password);
        }
    }

    // Login com localStorage (fallback)
    async loginWithLocalStorage(email, password) {
        try {
            const users = JSON.parse(localStorage.getItem('admac_users') || '[]');
            const user = users.find(u => u.email === email && u.password === password);

            // Conta admin hardcoded
            if (email === 'admin@admac.com' && password === 'REDACTED_SENHA') {
                const adminUser = {
                    id: 'admin',
                    name: 'Admin',
                    email: 'admin@admac.com',
                    userType: 'admin'
                };

                localStorage.setItem('isAuthenticated', 'true');
                localStorage.setItem('user', JSON.stringify(adminUser));

                console.log('✅ Login realizado (admin hardcoded)');

                return {
                    success: true,
                    user: adminUser,
                    offline: true
                };
            }

            if (!user) {
                throw new Error('E-mail ou senha incorretos');
            }

            const userData = {
                id: user.id,
                name: user.name,
                email: user.email,
                userType: user.userType
            };

            localStorage.setItem('isAuthenticated', 'true');
            localStorage.setItem('user', JSON.stringify(userData));

            console.log('✅ Login realizado com localStorage:', email);

            return {
                success: true,
                user: userData,
                offline: true
            };

        } catch (error) {
            console.error('localStorage login error:', error);
            throw error;
        }
    }

    // =====================================================
    // LOGOUT
    // =====================================================
    async logout() {
        try {
            // Logout do Supabase
            if (this.isOnline) {
                await supabase.auth.signOut();
            }

            // Limpar localStorage
            localStorage.removeItem('isAuthenticated');
            localStorage.removeItem('user');
            localStorage.removeItem('rememberMe');
            localStorage.removeItem('currentSessionId');

            console.log('✅ Logout realizado');

            return { success: true };

        } catch (error) {
            console.error('Logout error:', error);
            throw error;
        }
    }

    // =====================================================
    // OBTER USUÁRIO ATUAL
    // =====================================================
    async getCurrentUser() {
        try {
            // Tentar obter do Supabase primeiro
            if (this.isOnline) {
                const { data: { user }, error } = await supabase.auth.getUser();
                
                if (!error && user) {
                    // Buscar perfil
                    const { data: profile } = await supabase
                        .from('user_profiles')
                        .select('*')
                        .eq('id', user.id)
                        .single();

                    return {
                        id: user.id,
                        email: user.email,
                        name: profile?.name || user.user_metadata?.name || 'Usuário',
                        userType: profile?.user_type || user.user_metadata?.user_type || 'membro'
                    };
                }
            }

            // Fallback para localStorage
            const userStr = localStorage.getItem('user');
            if (userStr) {
                return JSON.parse(userStr);
            }

            return null;

        } catch (error) {
            console.error('Error getting current user:', error);
            return null;
        }
    }

    // =====================================================
    // ATUALIZAR PERFIL
    // =====================================================
    async updateProfile(updates) {
        try {
            const currentUser = await this.getCurrentUser();
            if (!currentUser) {
                throw new Error('Usuário não autenticado');
            }

            if (this.isOnline) {
                // Atualizar no Supabase
                const { error } = await supabase
                    .from('user_profiles')
                    .update(updates)
                    .eq('id', currentUser.id);

                if (error) {
                    throw error;
                }

                console.log('✅ Perfil atualizado no Supabase');
            }

            // Atualizar no localStorage
            const updatedUser = { ...currentUser, ...updates };
            localStorage.setItem('user', JSON.stringify(updatedUser));

            return {
                success: true,
                user: updatedUser
            };

        } catch (error) {
            console.error('Error updating profile:', error);
            throw error;
        }
    }
}

// Exportar instância única (singleton)
const authService = new AuthService();
export default authService;
