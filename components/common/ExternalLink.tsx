import { Pressable, PressableProps } from 'react-native';
import { openBrowserAsync } from 'expo-web-browser';
import { Platform } from 'react-native';

interface ExternalLinkProps extends Omit<PressableProps, 'onPress'> {
  href: string;
  children: React.ReactNode;
}

export function ExternalLink({ href, children, ...rest }: ExternalLinkProps) {
  const handlePress = async () => {
    if (Platform.OS !== 'web') {
      await openBrowserAsync(href);
    } else {
      window.open(href, '_blank');
    }
  };

  return (
    <Pressable onPress={handlePress} {...rest}>
      {children}
    </Pressable>
  );
}
