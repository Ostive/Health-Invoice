'use client'

import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { InvoiceService } from '../services/invoiceService';
import { User } from '@supabase/supabase-js';

interface TestResult {
    name: string;
    status: 'pending' | 'success' | 'error' | 'warning';
    message: string;
    data?: any;
}

interface DatabaseTestProps {
    user?: User | null;
}

export const DatabaseTest: React.FC<DatabaseTestProps> = ({ user: initialUser }) => {
    const [results, setResults] = useState<TestResult[]>([]);
    const [user, setUser] = useState<User | null>(initialUser || null);
    const [isRunning, setIsRunning] = useState(false);

    // Update user when prop changes
    useEffect(() => {
        if (initialUser) {
            setUser(initialUser);
        } else {
            checkUser();
        }
    }, [initialUser]);

    // Auto-run tests when user becomes available
    useEffect(() => {
        if (user && results.length === 0) {
            console.log('[DatabaseTest] Auto-running tests with user:', user.email);
            runAllTests();
        }
    }, [user]);

    const addResult = (result: TestResult) => {
        setResults(prev => [...prev, result]);
    };

    const clearResults = () => {
        setResults([]);
    };

    const checkUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
    };

    const runAllTests = async () => {
        console.log('=== STARTING DATABASE TESTS ===');
        console.log('User state:', user);
        setIsRunning(true);
        clearResults();

        try {

            // Test 1: Auth - get fresh user
            addResult({
                name: 'Check Authentication',
                status: 'pending',
                message: 'Checking auth...'
            });

            const { data: { user: currentUser } } = await supabase.auth.getUser();
            console.log('Got current user:', currentUser);

            if (!currentUser) {
                addResult({
                    name: 'Check Authentication',
                    status: 'error',
                    message: 'Not authenticated'
                });
                setIsRunning(false);
                return;
            }

            addResult({
                name: 'Check Authentication',
                status: 'success',
                message: `Authenticated as ${currentUser.email}`,
                data: { user_id: currentUser.id }
            });
            console.log('[TEST] Auth check complete, starting table checks...');

            // Test 2: Check invoices table
            console.log('[TEST] Test 2: Checking invoices table...');
            addResult({
                name: 'Check Invoices Table',
                status: 'pending',
                message: 'Checking table...'
            });

            try {
                const { data, error } = await supabase
                    .from('invoices')
                    .select('id')
                    .limit(1);

                if (error) {
                    addResult({
                        name: 'Check Invoices Table',
                        status: 'error',
                        message: error.message,
                        data: { code: error.code }
                    });
                } else {
                    addResult({
                        name: 'Check Invoices Table',
                        status: 'success',
                        message: 'Table exists and accessible'
                    });
                }
            } catch (err: any) {
                addResult({
                    name: 'Check Invoices Table',
                    status: 'error',
                    message: err.message
                });
            }

            // Test 3: Fetch invoices using service
            addResult({
                name: 'Fetch Invoices (Service)',
                status: 'pending',
                message: 'Fetching...'
            });

            try {
                console.log('[TEST] Calling InvoiceService.fetchAll with user ID:', currentUser.id);
                const invoices = await InvoiceService.fetchAll(currentUser.id);
                console.log('[TEST] Received invoices:', invoices);

                addResult({
                    name: 'Fetch Invoices (Service)',
                    status: 'success',
                    message: `Found ${invoices.length} invoices`,
                    data: invoices
                });
            } catch (err: any) {
                console.error('[TEST] Error fetching invoices:', err);
                addResult({
                    name: 'Fetch Invoices (Service)',
                    status: 'error',
                    message: err.message
                });
            }

            // Test 4: Check folders table
            addResult({
                name: 'Check Folders Table',
                status: 'pending',
                message: 'Checking table...'
            });

            try {
                const { data, error } = await supabase
                    .from('folders')
                    .select('id')
                    .limit(1);

                if (error) {
                    addResult({
                        name: 'Check Folders Table',
                        status: error.code === '42P01' ? 'warning' : 'error',
                        message: error.message,
                        data: { code: error.code }
                    });
                } else {
                    addResult({
                        name: 'Check Folders Table',
                        status: 'success',
                        message: 'Table exists and accessible'
                    });
                }
            } catch (err: any) {
                addResult({
                    name: 'Check Folders Table',
                    status: 'warning',
                    message: err.message
                });
            }

            // Test 5: Check profiles table
            addResult({
                name: 'Check Profiles Table',
                status: 'pending',
                message: 'Checking table...'
            });

            try {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', currentUser.id)
                    .single();

                if (error) {
                    addResult({
                        name: 'Check Profiles Table',
                        status: 'error',
                        message: error.message,
                        data: { code: error.code }
                    });
                } else {
                    addResult({
                        name: 'Check Profiles Table',
                        status: 'success',
                        message: 'Profile found',
                        data: data
                    });
                }
            } catch (err: any) {
                addResult({
                    name: 'Check Profiles Table',
                    status: 'error',
                    message: err.message
                });
            }

        } catch (globalErr: any) {
            console.error('=== TEST SUITE ERROR ===', globalErr);
            addResult({
                name: 'Test Suite Error',
                status: 'error',
                message: globalErr.message || 'Unknown error occurred',
                data: globalErr
            });
        } finally {
            setIsRunning(false);
            console.log('=== TESTS COMPLETE ===');
        }
    };

    const createTestInvoice = async () => {
        if (!user) {
            alert('Please login first');
            return;
        }

        addResult({
            name: 'Create Test Invoice',
            status: 'pending',
            message: 'Creating...'
        });

        try {
            const testInvoice = {
                id: crypto.randomUUID(),
                number: `TEST-${Date.now()}`,
                date: new Date().toISOString().split('T')[0],
                dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                status: 'Brouillon' as any,
                template: 'modern' as any,
                notes: 'Test invoice from diagnostic',
                client: {
                    name: 'Test Client',
                    address: '123 Test St',
                    email: 'test@client.com'
                },
                items: [
                    {
                        id: crypto.randomUUID(),
                        description: 'Test Service',
                        quantity: 1,
                        unitPrice: 100
                    }
                ],
                folderId: null
            };

            const saved = await InvoiceService.save(testInvoice, user.id);

            addResult({
                name: 'Create Test Invoice',
                status: 'success',
                message: `Invoice created: ${saved.number}`,
                data: saved
            });
        } catch (err: any) {
            addResult({
                name: 'Create Test Invoice',
                status: 'error',
                message: err.message
            });
        }
    };

    const getStatusColor = (status: TestResult['status']) => {
        switch (status) {
            case 'success': return 'bg-green-50 border-green-200 text-green-800';
            case 'error': return 'bg-red-50 border-red-200 text-red-800';
            case 'warning': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
            default: return 'bg-blue-50 border-blue-200 text-blue-800';
        }
    };

    const getStatusIcon = (status: TestResult['status']) => {
        switch (status) {
            case 'success': return '✓';
            case 'error': return '✗';
            case 'warning': return '⚠';
            default: return '⟳';
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-3xl font-bold">Database Connection Test</h1>
                    <a
                        href="/"
                        className="px-4 py-2 bg-slate-600 text-white rounded hover:bg-slate-700"
                    >
                        ← Back to App
                    </a>
                </div>

                <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4">User Status</h2>
                    {user ? (
                        <div className="bg-green-50 border border-green-200 rounded p-4">
                            <p className="text-green-800">
                                ✓ Authenticated as <strong>{user.email}</strong>
                            </p>
                            <p className="text-sm text-green-600 mt-1">
                                User ID: {user.id}
                            </p>
                        </div>
                    ) : (
                        <div className="bg-red-50 border border-red-200 rounded p-4">
                            <p className="text-red-800">✗ Not authenticated - Please login first</p>
                        </div>
                    )}
                </div>

                <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4">Actions</h2>
                    <div className="flex gap-3">
                        <button
                            onClick={runAllTests}
                            disabled={isRunning || !user}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                        >
                            {isRunning ? 'Running Tests...' : 'Run All Tests'}
                        </button>
                        <button
                            onClick={createTestInvoice}
                            disabled={!user}
                            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                        >
                            Create Test Invoice
                        </button>
                        <button
                            onClick={clearResults}
                            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                        >
                            Clear Results
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold mb-4">Test Results</h2>
                    {results.length === 0 ? (
                        <p className="text-gray-500">No tests run yet. Click "Run All Tests" to start.</p>
                    ) : (
                        <div className="space-y-3">
                            {results.map((result, index) => (
                                <div
                                    key={index}
                                    className={`border rounded-lg p-4 ${getStatusColor(result.status)}`}
                                >
                                    <div className="flex items-start gap-3">
                                        <span className="text-xl">{getStatusIcon(result.status)}</span>
                                        <div className="flex-1">
                                            <h3 className="font-semibold">{result.name}</h3>
                                            <p className="text-sm mt-1">{result.message}</p>
                                            {result.data && (
                                                <details className="mt-2">
                                                    <summary className="text-sm cursor-pointer hover:underline">
                                                        View data
                                                    </summary>
                                                    <pre className="mt-2 text-xs bg-white bg-opacity-50 p-2 rounded overflow-x-auto">
                                                        {JSON.stringify(result.data, null, 2)}
                                                    </pre>
                                                </details>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h3 className="font-semibold text-yellow-800 mb-2">Troubleshooting</h3>
                    <ul className="text-sm text-yellow-700 space-y-1">
                        <li>• If tables are missing (error 42P01), run the migration SQL in Supabase Dashboard</li>
                        <li>• Check browser console (F12) for detailed error logs</li>
                        <li>• Verify SUPABASE_URL and SUPABASE_ANON_KEY in .env file</li>
                        <li>• Make sure you're logged in with a valid account</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};
