import 'react-native-url-polyfill/auto';

import React from 'react';
import { AppRegistry } from 'react-native';
import App from './App';
import { AuthProvider } from './config/AuthContext';
import { Provider as PaperProvider } from 'react-native-paper';

const Root = () => (
    <PaperProvider> 
        <AuthProvider>
            <App />
        </AuthProvider>
     </PaperProvider>
);

AppRegistry.registerComponent('main', () => Root);