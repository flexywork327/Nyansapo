import React from 'react';
import { Redirect } from 'expo-router';

export default function Index() {
  // Direct redirect to class performance screen
  return <Redirect href="/class-performance" />;
}
