import { mockStore } from './data';
import { ApiError, ErrorCodes } from '../errors';
import { 
  LoginCredentials, 
  RegisterData, 
  Job, 
  JobStatus, 
  UserRole,
  ConvoyStatus 
} from '../types';

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const mockClient = {
  auth: {
    login: async (credentials: LoginCredentials) => {
      await delay(500);
      
      // Check seeded users
      const users = mockStore.getAll('profiles');
      
      // Simple mock login logic
      if (credentials.email === 'mock-owner@example.com' && credentials.password === 'password123') {
        return mockStore.getById('profiles', 'user-owner');
      }
      if (credentials.email === 'mock-manager@example.com' && credentials.password === 'password123') {
        return mockStore.getById('profiles', 'user-manager');
      }
      if (credentials.email === 'mock-driver@example.com' && credentials.password === 'password123') {
        return mockStore.getById('profiles', 'user-driver');
      }
      
      // Check for registered users (persisted in local storage)
      const user = users.find((u: any) => u.email === credentials.email);
      if (user) {
         // In a real app we'd check password hash, here we just allow if seeded
         return user;
      }

      throw new ApiError('Invalid credentials', ErrorCodes.UNAUTHORIZED, 401);
    },

    register: async (data: RegisterData) => {
        await delay(800);
        
        // Validate invite
        const invites = mockStore.getAll('invites');
        const invite = invites.find(i => i.code === data.inviteCode);
        
        if (!invite) {
            throw new ApiError('Invalid invite code', ErrorCodes.VALIDATION_ERROR, 400);
        }
        
        if (invite.max_uses && invite.use_count >= invite.max_uses) {
             throw new ApiError('Invite code expired', ErrorCodes.VALIDATION_ERROR, 400);
        }
        
        const userId = `user-${Date.now()}`;
        const newProfile = {
            id: userId,
            display_name: data.displayName,
            avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.displayName}`,
            role: 'driver' as UserRole,
            created_at: new Date().toISOString(),
            // Mock email storage (not in public profile type, but needed for login)
            email: data.email 
        };
        
        mockStore.add('profiles', newProfile as any);
        
        // Update invite
        mockStore.update('invites', invite.id, { use_count: invite.use_count + 1 });
        
        return newProfile;
    },

    me: async () => {
       // In mock mode, we reply on the assumption that the UI calls this with some context 
       // or we just return the user if we had a proper session manager.
       // For this simple mock, we'll assume the caller handles session state via global store.
       // This function acts as a validity check.
       await delay(200);
       return null; // The auth store handles the "current user" in mock mode
    },
    
    logout: async () => {
        await delay(200);
        return true;
    }
  },

  jobs: {
    list: async (userId: string) => {
      await delay(400);
      return mockStore.getJobsByUserId(userId);
    },

    create: async (data: Omit<Job, 'id' | 'created_at' | 'completed_at' | 'status'>) => {
      await delay(600);
      const newJob: Job = {
        ...data,
        id: `job-${Date.now()}`,
        created_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
        status: 'pending' as JobStatus,
        truck_id: data.truck_id || null,
        trailer_id: data.trailer_id || null,
      };
      mockStore.add('jobs', newJob);
      return newJob;
    },
    
    get: async (id: string) => {
        await delay(200);
        const job = mockStore.getById('jobs', id);
        if (!job) throw new ApiError('Job not found', ErrorCodes.NOT_FOUND, 404);
        return job;
    }
  },

  leaderboard: {
    get: async () => {
      await delay(300);
      return mockStore.getLeaderboard();
    }
  },
  
  convoys: {
      list: async () => {
          await delay(300);
          return mockStore.getAll('convoys');
      },
      signup: async (convoyId: string, userId: string) => {
          await delay(400);
          // Just a mock success
          return { success: true };
      }
  },
  
  profiles: {
      get: async (id: string) => {
          await delay(200);
          const profile = mockStore.getById('profiles', id);
          if (!profile) throw new ApiError('Profile not found', ErrorCodes.NOT_FOUND, 404);
          return profile;
      },
      update: async (userId: string, data: any) => {
          await delay(400);
          mockStore.update('profiles', userId, data);
          return mockStore.getById('profiles', userId);
      }
  },

  trucks: {
      list: async (userId: string) => {
          await delay(300);
          return mockStore.getAll('trucks').filter((t: any) => t.user_id === userId);
      }
  },

  devices: {
      createPairingCode: async () => {
          await delay(200);
          return { code: '123456', expires_at: new Date(Date.now() + 600000).toISOString() };
      },
      list: async () => {
          await delay(300);
          return [
              { id: 'dev-1', name: 'Desktop App', last_seen: new Date().toISOString(), is_active: true }
          ];
      },
      revoke: async (id: string) => {
          await delay(200);
          return true;
      }
  },
  
  admin: {
      getDrivers: async () => {
          await delay(300);
          return mockStore.getAll('profiles');
      },
      getInvites: async () => {
          await delay(300);
          return mockStore.getAll('invites');
      },
      updateRole: async (userId: string, role: string) => {
          await delay(200);
          mockStore.update('profiles', userId, { role: role as any });
          return true;
      },
      toggleActive: async (userId: string, isActive: boolean) => {
          await delay(200);
          // In mock store, active status might not be on profile?
          // Profile type doesn't have is_active.
          // Role type in DB is separate table 'user_roles'.
          // Mock store profiles has 'role' field directly.
          // We can add 'is_active' to mock profile or ignore.
          // Let's add it to mock profile update just in case.
          mockStore.update('profiles', userId, { is_active: isActive } as any);
          return true;
      // ... admin actions
  },

  invites: {
      validate: async (code: string) => {
          await delay(200);
          const invite = mockStore.getAll('invites').find((i: any) => i.code === code);
          if (!invite) return null;
          // Check expiration, usage etc if needed, simplified for mock
          return invite;
      },
      claim: async (code: string, userId: string) => {
          await delay(200);
          const invite = mockStore.getAll('invites').find((i: any) => i.code === code);
          if (invite) {
             mockStore.update('invites', invite.id, { 
                 use_count: (invite.use_count || 0) + 1,
                 used_by: userId
             });
          }
          return true;
      }
  }
};
