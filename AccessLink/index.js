import { registerRootComponent } from 'expo';
import { enableScreens } from 'react-native-screens';
import App from './src/App';

// Enable react-native-screens for better performance and accessibility
enableScreens();

// Register the main component
registerRootComponent(App);
