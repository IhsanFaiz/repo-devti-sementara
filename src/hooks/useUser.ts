import { useSession } from 'next-auth/react';
import { withBasePath } from 'utils/path';

interface UserProps {
  username: string;
  role: string;
  id: string;
  email: string;
  photo?: string;
}

const useUser = () => {
  const { data: session } = useSession();
  
  if (session?.user) {
    const user = session.user;

    const newUser: UserProps = {
      username: user.name || '',
      role: user.role || '',
      email: user.email || '',
      id: user.id || '',
      photo: user.image || withBasePath('/assets/images/users/avatar-1.png')
    };

    return newUser;
  }
  return null;
};

export default useUser;
