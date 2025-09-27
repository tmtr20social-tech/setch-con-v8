import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Input from './Input';

const PasswordInput = ({
  label = "Password",
  value,
  onChangeText,
  placeholder = "Enter password",
  showRequirements = false,
  style,
  ...props
}) => {
  const [requirements, setRequirements] = useState({
    minLength: false,
    hasUppercase: false,
    hasNumber: false,
    hasSpecialChar: false,
  });

  useEffect(() => {
    if (showRequirements) {
      checkPasswordRequirements(value);
    }
  }, [value, showRequirements]);

  const checkPasswordRequirements = (password) => {
    if (!password) {
      setRequirements({
        minLength: false,
        hasUppercase: false,
        hasNumber: false,
        hasSpecialChar: false,
      });
      return;
    }

    setRequirements({
      minLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    });
  };

  const isPasswordValid = () => {
    return Object.values(requirements).every(req => req);
  };

  const renderRequirement = (text, isValid) => (
    <View style={styles.requirementItem} key={text}>
      <Ionicons
        name={isValid ? 'checkmark-circle' : 'close-circle'}
        size={16}
        color={isValid ? '#4CAF50' : '#F44336'}
      />
      <Text style={[
        styles.requirementText,
        { color: isValid ? '#4CAF50' : '#F44336' }
      ]}>
        {text}
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, style]}>
      <Input
        label={label}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        secureTextEntry
        {...props}
      />
      
      {showRequirements && (
        <View style={styles.requirementsContainer}>
          <Text style={styles.requirementsTitle}>Password Requirements:</Text>
          {renderRequirement('At least 8 characters', requirements.minLength)}
          {renderRequirement('At least 1 uppercase letter', requirements.hasUppercase)}
          {renderRequirement('At least 1 number', requirements.hasNumber)}
          {renderRequirement('At least 1 special character (!@#$%^&*)', requirements.hasSpecialChar)}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  requirementsContainer: {
    marginTop: 8,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  requirementText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },
});

export { PasswordInput };
export default PasswordInput;