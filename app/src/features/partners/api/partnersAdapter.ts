import { Partner } from '../types';
import { fetchPartners, fetchPartnerById } from './partnersApi';

export const adaptPartnersData = (data: any): Partner[] => {
    return data.map((item: any) => ({
        id: item.id,
        name: item.name,
        status: item.status,
        contractType: item.contractType,
        usersManaged: item.usersManaged,
        performance: item.performance,
        activity: item.activity || '',
        createdAt: String(item.createdAt ?? item.created_at ?? ''),
        updatedAt: String(item.updatedAt ?? item.updated_at ?? ''),
    }));
};

export const adaptPartnerData = (data: any): Partner => ({
    id: data.id,
    name: data.name,
    status: data.status,
    contractType: data.contractType,
    usersManaged: data.usersManaged,
    performance: data.performance,
    activity: data.activity || '',
    createdAt: String(data.createdAt ?? data.created_at ?? ''),
    updatedAt: String(data.updatedAt ?? data.updated_at ?? ''),
});

export const getPartners = async () => {
    const list = await fetchPartners();
    return adaptPartnersData(list);
};

export const getPartnerById = async (id: string) => {
    const partner = await fetchPartnerById(id);
    return adaptPartnerData(partner);
};