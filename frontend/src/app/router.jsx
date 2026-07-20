import { createBrowserRouter } from 'react-router-dom';

import App from '@/app/App';
import Home from '@/pages/Home';
import SignIn from '@/pages/SignIn';
import SignUp from '@/pages/SignUp';
import Profile from '@/pages/Profile';
import Channel from '@/pages/Channel';
import VideoPlayer from '@/pages/VideoPlayer';
import CreateChannel from '@/pages/CreateChannel';
import EditChannel from '@/pages/EditChannel';
import UploadVideo from '@/pages/UploadVideo';
import UpdateVideo from '@/pages/UpdateVideo';
import NotFound from '@/pages/NotFound';

export const router = createBrowserRouter([
    {
        path: '/',
        element: <App />,
        children: [
            { path: '/', element: <Home /> },
            { path: 'signin', element: <SignIn /> },
            { path: 'signup', element: <SignUp /> },
            { path: 'profile', element: <Profile /> },
            { path: 'channel/:channelId', element: <Channel /> },
            { path: 'video/:videoId', element: <VideoPlayer /> },
            { path: 'create-channel', element: <CreateChannel /> },
            { path: 'update-channel/:channelId', element: <EditChannel /> },
            { path: 'upload-video', element: <UploadVideo /> },
            { path: 'update-video/:videoId', element: <UpdateVideo /> },
        ],
        errorElement: <NotFound />,
    },
]);
