import React from "react";
import { Animated } from "react-native";
import { useTheme } from "../theme";

type HorizontalLoaderProps = { isLoading: boolean };
export function HorizontalLoader({ isLoading }: HorizontalLoaderProps) {
  const theme = useTheme();
  const fadeAnimation = React.useRef(new Animated.Value(0)).current;
  const useNativeDriver = true;
  const duration = 300;
  React.useLayoutEffect(() => {
    if (isLoading) {
      const loopAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(fadeAnimation, {
            toValue: 1,
            duration,
            useNativeDriver,
          }),
          Animated.timing(fadeAnimation, {
            toValue: 0.5,
            duration,
            useNativeDriver,
          }),
        ])
      );
      loopAnimation.start();
      return () => loopAnimation.stop();
    } else {
      const timingAnimation = Animated.timing(fadeAnimation, {
        toValue: 0,
        duration,
        useNativeDriver,
      });
      timingAnimation.start();
      return () => timingAnimation.stop();
    }
  }, [fadeAnimation, isLoading]);
  return (
    <Animated.View
      style={{
        height: 4,
        backgroundColor: theme.activeColor,
        opacity: fadeAnimation,
      }}
    ></Animated.View>
  );
}
