// =====================================================
// ADMAC - Authentication Service
// =====================================
// Serviço centralizado para gerenciar autenticação com localStorage
// =====================================================

class AuthService {
    constructor() {
    }

    // =====================================================
    // REGISTRO DE USUÁRIO
    // =====================================================
    async register(name, email, password, userType, photo = null) {
        return await this.registerWithLocalStorage(name, email, password, userType, photo);
    }

    // Registro com localStorage (fallback)
    async registerWithLocalStorage(name, email, password, userType, photo = null) {
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
                photo,
                createdAt: new Date().toISOString()
            };

            users.push(newUser);
            localStorage.setItem('admac_users', JSON.stringify(users));

            console.log('✅ Usuário registrado no localStorage:', email);

            return {
                success: true,
                user: newUser,
                message: 'Cadastro realizado com sucesso!',
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
        return await this.loginWithLocalStorage(email, password);
    }

    // Login com localStorage (fallback)
    async loginWithLocalStorage(email, password) {
        try {
            const users = JSON.parse(localStorage.getItem('admac_users') || '[]');
            const user = users.find(u => u.email === email && u.password === password);

            // Conta admin hardcoded
            if (email === 'admin@admin.com' && password === '123456') {
                const adminUser = {
                    id: 'admin',
                    name: 'Admin',
                    email: 'admin@admin.com',
                    userType: 'admin',
                    photo: null
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
                userType: user.userType,
                photo: user.photo
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
            localStorage.removeItem('isAuthenticated');
            localStorage.removeItem('user');
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

            const updatedUser = { ...currentUser, ...updates };
            
            // Atualizar no localStorage principal
            localStorage.setItem('user', JSON.stringify(updatedUser));
            
            // Atualizar na lista de usuários
            const users = JSON.parse(localStorage.getItem('admac_users') || '[]');
            const updatedUsers = users.map(u => u.email === updatedUser.email ? { ...u, ...updates } : u);
            localStorage.setItem('admac_users', JSON.stringify(updatedUsers));

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
