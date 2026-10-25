import ProfileComponent from '@/component/profile';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Saasno - Profile',
    description: 'User profile',
};

export default function ProfilePage() {
    return <ProfileComponent />;
}
