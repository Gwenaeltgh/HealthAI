export interface Partner {
  id: string;
  name: string;
  status: 'active' | 'inactive';
  contractType: string;
  usersManaged: number;
  activity: string;
  performance: string;
  createdAt: string;
  updatedAt: string;
}

export interface PartnerDetail {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive';
  contractType: string;
  usersManaged: number;
  activity: string;
  performance: string;
  createdAt: string;
  updatedAt: string;
}