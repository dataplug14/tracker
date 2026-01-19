import { Profile, Job, Truck, Trailer, Convoy, Invite, ConvoySignup } from '../types';

const STORAGE_KEY = 'vtc_tracker_mock_data';

interface MockData {
  profiles: Profile[];
  jobs: Job[];
  trucks: Truck[];
  trailers: Trailer[];
  convoys: Convoy[];
  invites: Invite[];
  convoySignups: ConvoySignup[];
}

const SEED_DATA: MockData = {
  profiles: [
    {
      id: 'user-owner',
      display_name: 'VTC Owner',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=owner',
      role: 'owner',
      created_at: new Date().toISOString(),
    },
    {
      id: 'user-manager',
      display_name: 'Fleet Manager',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=manager',
      role: 'manager',
      created_at: new Date().toISOString(),
    },
    {
      id: 'user-driver',
      display_name: 'Pro Driver',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=driver',
      role: 'driver',
      created_at: new Date().toISOString(),
    },
  ],
  jobs: [
    {
      id: 'job-1',
      user_id: 'user-driver',
      game: 'ets2',
      source_city: 'Berlin',
      destination_city: 'Paris',
      cargo: 'Electronics',
      distance_km: 1050,
      revenue: 25000,
      damage_percent: 0,
      status: 'approved',
      truck_id: 'truck-1',
      trailer_id: null,
      completed_at: new Date(Date.now() - 86400000).toISOString(),
      created_at: new Date(Date.now() - 90000000).toISOString(),
    },
    {
      id: 'job-2',
      user_id: 'user-driver',
      game: 'ats',
      source_city: 'Los Angeles',
      destination_city: 'San Francisco',
      cargo: 'Heavy Machinery',
      distance_km: 650,
      revenue: 15000,
      damage_percent: 2.5,
      status: 'pending',
      truck_id: 'truck-2',
      trailer_id: null,
      completed_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    },
  ],
  trucks: [
    {
      id: 'truck-1',
      user_id: 'user-driver',
      game: 'ets2',
      brand: 'Scania',
      model: 'S 730',
      custom_name: 'Green Beast',
      created_at: new Date().toISOString(),
    },
    {
      id: 'truck-2',
      user_id: 'user-driver',
      game: 'ats',
      brand: 'Peterbilt',
      model: '389',
      custom_name: 'Old Reliable',
      created_at: new Date().toISOString(),
    },
  ],
  trailers: [
    {
      id: 'trailer-1',
      trailer_type: 'Refrigerated',
      custom_name: 'Cool Box',
    } as Trailer // Casting to handle partial seed
  ],
  convoys: [
    {
      id: 'convoy-1',
      title: 'Weekly VTC Convoy',
      description: 'Join us for our weekly drive across Europe!',
      game: 'ets2',
      server: 'Simulation 1',
      departure_city: 'London',
      arrival_city: 'Munich',
      scheduled_at: new Date(Date.now() + 86400000 * 3).toISOString(), // 3 days from now
      status: 'scheduled',
      organizer: { id: 'user-owner', display_name: 'VTC Owner' } as any,
    },
  ],
  invites: [
    {
      id: 'invite-1',
      code: 'VTC-WELCOME',
      created_by: 'user-owner',
      used_by: null,
      max_uses: 10,
      use_count: 0,
      expires_at: null,
      created_at: new Date().toISOString(),
    },
  ],
  convoySignups: [],
};

export class MockDataStore {
  private data: MockData;

  constructor() {
    this.data = this.load();
  }

  private load(): MockData {
    if (typeof window === 'undefined') return SEED_DATA;
    
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    return SEED_DATA;
  }

  private save() {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
  }

  // Generic helpers
  getAll<K extends keyof MockData>(collection: K): MockData[K] {
    return this.data[collection];
  }

  getById<K extends keyof MockData>(collection: K, id: string): MockData[K][number] | undefined {
    // @ts-ignore
    return this.data[collection].find((item) => item.id === id);
  }

  add<K extends keyof MockData>(collection: K, item: MockData[K][number]) {
    // @ts-ignore
    this.data[collection].unshift(item);
    this.save();
  }

  update<K extends keyof MockData>(collection: K, id: string, updates: Partial<MockData[K][number]>) {
    // @ts-ignore
    this.data[collection] = this.data[collection].map((item) => 
      item.id === id ? { ...item, ...updates } : item
    );
    this.save();
  }
  
  // Specific queries needed for UI
  getJobsByUserId(userId: string) {
    return this.data.jobs
      .filter(job => job.user_id === userId)
      .map(job => ({
        ...job,
        truck: this.getById('trucks', job.truck_id || ''),
        trailer: this.getById('trailers', job.trailer_id || ''),
      }));
  }

  getLeaderboard() {
    const stats = new Map<string, any>();
    
    this.data.jobs.forEach(job => {
      if (job.status !== 'approved') return;
      
      if (!stats.has(job.user_id)) {
        const profile = this.getById('profiles', job.user_id);
        stats.set(job.user_id, {
          user_id: job.user_id,
          display_name: profile?.display_name || 'Unknown',
          avatar_url: profile?.avatar_url || null,
          total_km: 0,
          total_jobs: 0,
          total_revenue: 0,
        });
      }
      
      const stat = stats.get(job.user_id);
      stat.total_km += job.distance_km;
      stat.total_jobs += 1;
      stat.total_revenue += job.revenue;
    });

    return Array.from(stats.values()).sort((a, b) => b.total_km - a.total_km);
  }

  reset() {
    this.data = SEED_DATA;
    this.save();
  }
}

export const mockStore = new MockDataStore();
