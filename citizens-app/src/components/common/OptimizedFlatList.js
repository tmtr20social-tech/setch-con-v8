import React, { memo, useCallback, useMemo } from 'react';
import { FlatList, View, Text, StyleSheet } from 'react-native';
import LoadingSpinner from './LoadingSpinner';

const OptimizedFlatList = memo(({
  data,
  renderItem,
  keyExtractor,
  loading = false,
  error = null,
  onRefresh,
  refreshing = false,
  onEndReached,
  onEndReachedThreshold = 0.1,
  estimatedItemSize = 120,
  emptyComponent,
  emptyTitle = "No items found",
  emptySubtitle = "There are no items to display",
  style,
  contentContainerStyle,
  ...props
}) => {
  // Memoized getItemLayout for better performance
  const getItemLayout = useCallback((data, index) => ({
    length: estimatedItemSize,
    offset: estimatedItemSize * index,
    index,
  }), [estimatedItemSize]);

  // Memoized empty component
  const EmptyComponent = useMemo(() => {
    if (loading) {
      return <LoadingSpinner message="Loading..." />;
    }

    if (error) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.errorTitle}>Error</Text>
          <Text style={styles.errorSubtitle}>{error}</Text>
        </View>
      );
    }

    if (emptyComponent) {
      return emptyComponent;
    }

    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>{emptyTitle}</Text>
        <Text style={styles.emptySubtitle}>{emptySubtitle}</Text>
      </View>
    );
  }, [loading, error, emptyComponent, emptyTitle, emptySubtitle]);

  // Memoized refresh control props
  const refreshControlProps = useMemo(() => ({
    refreshing,
    onRefresh,
  }), [refreshing, onRefresh]);

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      getItemLayout={getItemLayout}
      ListEmptyComponent={EmptyComponent}
      onEndReached={onEndReached}
      onEndReachedThreshold={onEndReachedThreshold}
      refreshControl={onRefresh ? refreshControlProps : undefined}
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      updateCellsBatchingPeriod={50}
      initialNumToRender={10}
      windowSize={10}
      style={[styles.container, style]}
      contentContainerStyle={[
        data?.length === 0 && styles.emptyContentContainer,
        contentContainerStyle
      ]}
      {...props}
    />
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyContentContainer: {
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F44336',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
});

OptimizedFlatList.displayName = 'OptimizedFlatList';

export default OptimizedFlatList;