import './styles.css';
import { definePterodactylExtension } from '@pterodactyl/sdk';
import NextWipeCard from './components/NextWipeCard';

export default definePterodactylExtension({
    setup({ slots }) {
        slots.register('server.console.before', NextWipeCard);
    },
});
