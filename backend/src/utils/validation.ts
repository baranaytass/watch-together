/**
 * Domain validation utility functions
 */

/**
 * Validates if the given string is a valid domain
 * Accepts domains like: youtube.com, www.youtube.com, m.youtube.com
 */
export const validateDomain = (domain: string): boolean => {
    // Basic domain validation regex
    const domainRegex = /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
    return domainRegex.test(domain);
};

/**
 * Validates if the given URL pattern is valid
 * Accepts patterns like: youtube.com/watch?v=*, youtube.com/v/*
 */
export const validateUrlPattern = (pattern: string): boolean => {
    // Basic URL pattern validation
    if (!pattern || typeof pattern !== 'string') {
        return false;
    }

    // Pattern should contain at least one wildcard
    if (!pattern.includes('*')) {
        return false;
    }

    // Pattern should not contain invalid characters
    const invalidChars = /[<>'"]/;
    if (invalidChars.test(pattern)) {
        return false;
    }

    return true;
};

/**
 * Validates provider data
 */
export const validateProviderData = (data: {
    name?: string;
    domain?: string;
    patterns?: string[];
}): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!data.name || typeof data.name !== 'string' || data.name.length < 2) {
        errors.push('Name must be at least 2 characters long');
    }

    if (!data.domain || !validateDomain(data.domain)) {
        errors.push('Invalid domain format');
    }

    if (!Array.isArray(data.patterns) || data.patterns.length === 0) {
        errors.push('At least one URL pattern is required');
    } else {
        const invalidPatterns = data.patterns.filter(pattern => !validateUrlPattern(pattern));
        if (invalidPatterns.length > 0) {
            errors.push(`Invalid URL patterns: ${invalidPatterns.join(', ')}`);
        }
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}; 