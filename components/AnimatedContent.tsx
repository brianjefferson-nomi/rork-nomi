import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';

interface AnimatedContentProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  style?: any;
}

// Fade in animation component
export const FadeInView: React.FC<AnimatedContentProps> = ({
  children,
  delay = 0,
  duration = 600,
  style,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration,
          useNativeDriver: true,
        }),
      ]).start();
    }, delay);

    return () => clearTimeout(timer);
  }, [fadeAnim, slideAnim, delay, duration]);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
};

// Staggered animation for lists
interface StaggeredListProps {
  children: React.ReactNode[];
  delay?: number;
  staggerDelay?: number;
  style?: any;
}

export const StaggeredList: React.FC<StaggeredListProps> = ({
  children,
  delay = 0,
  staggerDelay = 100,
  style,
}) => {
  return (
    <View style={style}>
      {children.map((child, index) => (
        <FadeInView
          key={index}
          delay={delay + index * staggerDelay}
          duration={400}
        >
          {child}
        </FadeInView>
      ))}
    </View>
  );
};

// Scale in animation for cards
export const ScaleInView: React.FC<AnimatedContentProps> = ({
  children,
  delay = 0,
  duration = 500,
  style,
}) => {
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration,
          useNativeDriver: true,
        }),
      ]).start();
    }, delay);

    return () => clearTimeout(timer);
  }, [scaleAnim, fadeAnim, delay, duration]);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
};

// Slide in from right animation
export const SlideInFromRight: React.FC<AnimatedContentProps> = ({
  children,
  delay = 0,
  duration = 500,
  style,
}) => {
  const slideAnim = useRef(new Animated.Value(50)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration,
          useNativeDriver: true,
        }),
      ]).start();
    }, delay);

    return () => clearTimeout(timer);
  }, [slideAnim, fadeAnim, delay, duration]);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity: fadeAnim,
          transform: [{ translateX: slideAnim }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
};

// Bounce in animation for buttons
export const BounceInView: React.FC<AnimatedContentProps> = ({
  children,
  delay = 0,
  duration = 600,
  style,
}) => {
  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.spring(bounceAnim, {
        toValue: 1,
        tension: 100,
        friction: 3,
        useNativeDriver: true,
      }).start();
    }, delay);

    return () => clearTimeout(timer);
  }, [bounceAnim, delay]);

  return (
    <Animated.View
      style={[
        style,
        {
          transform: [
            {
              scale: bounceAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 1],
              }),
            },
          ],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
};

// Pulse animation for loading states
export const PulseView: React.FC<AnimatedContentProps> = ({
  children,
  delay = 0,
  duration = 1000,
  style,
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 0.7,
            duration: duration / 2,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: duration / 2,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }, delay);

    return () => clearTimeout(timer);
  }, [pulseAnim, delay, duration]);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity: pulseAnim,
        },
      ]}
    >
      {children}
    </Animated.View>
  );
};
