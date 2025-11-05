import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import ConsumerLayout from '../components/ConsumerLayout'
import { apiKeysApi, purchasesApi } from '../api'
import { APIKey, APIPackagePurchase } from '../types'

export default function APIPackageKeys() {
    const { purchaseId } = useParams<{ purchaseId: string }>()
    const [packageInfo, setPackageInfo] = useState<APIPackagePurchase | null>(null)
    const [keys, setKeys] = useState<APIKey[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [keyName, setKeyName] = useState('')
    const [generating, setGenerating] = useState(false)
    const [successMessage, setSuccessMessage] = useState<string | null>(null)
    const [copiedKey, setCopiedKey] = useState<string | null>(null)

    // API Testing states
    const [selectedApiKey, setSelectedApiKey] = useState<string>('')
    const [testParams, setTestParams] = useState({
        provinceId: '',
        districtId: '',
        startDate: '',
        endDate: ''
    })
    const [testLoading, setTestLoading] = useState(false)
    const [testResult, setTestResult] = useState<any>(null)
    const [testError, setTestError] = useState<string | null>(null)

    useEffect(() => {
        if (purchaseId) {
            loadPackageData(parseInt(purchaseId))
        }
    }, [purchaseId])

    const loadPackageData = async (id: number) => {
        setLoading(true)
        setError(null)
        try {
            const [apiPackages, apiKeys] = await Promise.all([
                purchasesApi.getMyAPIPackages(),
                apiKeysApi.getAll(id),
            ])

            const pkg = apiPackages.find(p => p.purchaseId === id)
            if (!pkg) {
                throw new Error('API package not found')
            }

            setPackageInfo(pkg)
            setKeys(apiKeys)
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Failed to load API package')
        } finally {
            setLoading(false)
        }
    }

    const handleGenerateKey = async () => {
        if (!purchaseId) return

        setGenerating(true)
        setError(null)
        setSuccessMessage(null)
        try {
            const newKey = await apiKeysApi.generate(parseInt(purchaseId),
                keyName.trim() ? { keyName: keyName.trim() } : undefined
            )
            setKeys([newKey, ...keys])
            setKeyName('')
            setSuccessMessage('API key generated successfully!')
            setTimeout(() => setSuccessMessage(null), 3000)
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Failed to generate key')
        } finally {
            setGenerating(false)
        }
    }

    const handleRevokeKey = async (keyId: number, keyValue: string) => {
        if (!confirm(`Are you sure you want to revoke this API key?\n\nKey: ${keyValue.substring(0, 20)}...`)) {
            return
        }

        try {
            await apiKeysApi.revoke(keyId)
            setKeys(keys.map(k => k.keyId === keyId ? { ...k, isActive: false } : k))
            setSuccessMessage('API key revoked successfully')
            setTimeout(() => setSuccessMessage(null), 3000)
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Failed to revoke key')
        }
    }

    const handleCopyKey = (apiKey: string) => {
        navigator.clipboard.writeText(apiKey)
        setCopiedKey(apiKey)
        setTimeout(() => setCopiedKey(null), 2000)
    }

    const handleTestAPI = async () => {
        if (!selectedApiKey) {
            setTestError('Please select an API key')
            return
        }

        setTestLoading(true)
        setTestError(null)
        setTestResult(null)

        try {
            const params: any = {}
            if (testParams.provinceId) params.provinceId = parseInt(testParams.provinceId)
            if (testParams.districtId) params.districtId = parseInt(testParams.districtId)
            if (testParams.startDate) params.startDate = testParams.startDate
            if (testParams.endDate) params.endDate = testParams.endDate

            const result = await apiKeysApi.getData(selectedApiKey, params)
            setTestResult(result)
            
            // Reload package data to update usage stats
            if (purchaseId) {
                loadPackageData(parseInt(purchaseId))
            }
        } catch (err: any) {
            setTestError(err.response?.data?.message || err.message || 'Failed to query data')
        } finally {
            setTestLoading(false)
        }
    }

    const handleCopyTestResult = () => {
        if (testResult) {
            navigator.clipboard.writeText(JSON.stringify(testResult, null, 2))
            setSuccessMessage('Test result copied to clipboard!')
            setTimeout(() => setSuccessMessage(null), 2000)
        }
    }

    const getStatusBadge = (status: string) => {
        if (status === 'Active') {
            return 'bg-green-100 text-green-700 border-green-200'
        }
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }

    if (loading) {
        return (
            <ConsumerLayout>
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="text-center">
                        <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
                        <p className="text-gray-600 mt-4 text-lg">Loading API keys...</p>
                    </div>
                </div>
            </ConsumerLayout>
        )
    }

    if (error && !packageInfo) {
        return (
            <ConsumerLayout>
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="text-center max-w-md">
                        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Package</h3>
                        <p className="text-red-600 mb-6">{error}</p>
                        <Link
                            to="/my-purchases"
                            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                        >
                            Back to My Purchases
                        </Link>
                    </div>
                </div>
            </ConsumerLayout>
        )
    }

    return (
        <ConsumerLayout>
            <div className="bg-gray-50 min-h-screen">
                {/* Header */}
                <div className="bg-gradient-to-r from-orange-600 to-red-700 text-white py-12">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-4xl font-bold mb-3">🔌 API Package Management</h1>
                                <p className="text-orange-100 text-lg">Manage your API keys and access credentials</p>
                            </div>
                            <Link
                                to="/my-purchases"
                                className="bg-white text-orange-600 px-6 py-3 rounded-lg font-semibold hover:bg-orange-50 transition-colors"
                            >
                                ← Back to Purchases
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Package Info Cards */}
                    {packageInfo && (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                                <div className="text-sm text-gray-600 mb-2">Total API Calls</div>
                                <div className="text-3xl font-bold text-gray-900">
                                    {(packageInfo.totalAPICalls || 0).toLocaleString()}
                                </div>
                            </div>
                            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                                <div className="text-sm text-gray-600 mb-2">Calls Used</div>
                                <div className="text-3xl font-bold text-orange-600">
                                    {(packageInfo.apiCallsUsed || 0).toLocaleString()}
                                </div>
                            </div>
                            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                                <div className="text-sm text-gray-600 mb-2">Calls Remaining</div>
                                <div className="text-3xl font-bold text-green-600">
                                    {(packageInfo.apiCallsRemaining || 0).toLocaleString()}
                                </div>
                            </div>
                            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                                <div className="text-sm text-gray-600 mb-2">Status</div>
                                <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold border ${getStatusBadge(packageInfo.status)}`}>
                                    {packageInfo.status}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Success/Error Messages */}
                    {successMessage && (
                        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex items-center gap-3">
                            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-green-800 font-medium">{successMessage}</span>
                        </div>
                    )}
                    {error && packageInfo && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center gap-3">
                            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-red-800 font-medium">{error}</span>
                        </div>
                    )}

                    {/* Generate New Key */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Generate New API Key</h2>
                        <div className="flex gap-4">
                            <input
                                type="text"
                                value={keyName}
                                onChange={(e) => setKeyName(e.target.value)}
                                placeholder="Key name (optional)"
                                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            />
                            <button
                                onClick={handleGenerateKey}
                                disabled={generating || packageInfo?.status !== 'Active'}
                                className="bg-gradient-to-r from-orange-600 to-red-600 text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                            >
                                {generating ? (
                                    <span className="flex items-center gap-2">
                                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                        Generating...
                                    </span>
                                ) : (
                                    '+ Generate Key'
                                )}
                            </button>
                        </div>
                    </div>

                    {/* API Keys List */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-8">
                        <div className="p-6 border-b border-gray-200">
                            <h2 className="text-2xl font-bold text-gray-900">Your API Keys ({keys.length})</h2>
                        </div>
                        {keys.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="text-left py-3 px-6 font-semibold text-gray-700 text-sm">API Key</th>
                                            <th className="text-left py-3 px-6 font-semibold text-gray-700 text-sm">Name</th>
                                            <th className="text-left py-3 px-6 font-semibold text-gray-700 text-sm">Created</th>
                                            <th className="text-left py-3 px-6 font-semibold text-gray-700 text-sm">Last Used</th>
                                            <th className="text-center py-3 px-6 font-semibold text-gray-700 text-sm">Status</th>
                                            <th className="text-center py-3 px-6 font-semibold text-gray-700 text-sm">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {keys.map((key) => (
                                            <tr key={key.keyId} className="border-b border-gray-100 hover:bg-gray-50">
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center gap-2">
                                                        <code className="bg-gray-100 px-3 py-1 rounded text-sm font-mono text-gray-800">
                                                            {key.apiKey.substring(0, 20)}...
                                                        </code>
                                                        <button
                                                            onClick={() => handleCopyKey(key.apiKey)}
                                                            className="text-blue-600 hover:text-blue-700 p-1"
                                                            title="Copy to clipboard"
                                                        >
                                                            {copiedKey === key.apiKey ? (
                                                                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                                </svg>
                                                            ) : (
                                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                                </svg>
                                                            )}
                                                        </button>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6 text-gray-700">
                                                    {key.keyName || <span className="text-gray-400 italic">Unnamed</span>}
                                                </td>
                                                <td className="py-4 px-6 text-sm text-gray-600">
                                                    {new Date(key.createdAt).toLocaleString()}
                                                </td>
                                                <td className="py-4 px-6 text-sm text-gray-600">
                                                    {key.lastUsedAt ? new Date(key.lastUsedAt).toLocaleString() : (
                                                        <span className="text-gray-400 italic">Never</span>
                                                    )}
                                                </td>
                                                <td className="py-4 px-6 text-center">
                                                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${key.isActive ? 'bg-green-100 text-green-700 border-green-200' : 'bg-gray-100 text-gray-700 border-gray-200'
                                                        }`}>
                                                        {key.isActive ? 'Active' : 'Revoked'}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6 text-center">
                                                    {key.isActive && (
                                                        <button
                                                            onClick={() => handleRevokeKey(key.keyId, key.apiKey)}
                                                            className="text-red-600 hover:text-red-700 font-medium text-sm"
                                                        >
                                                            Revoke
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="p-12 text-center">
                                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">No API Keys Yet</h3>
                                <p className="text-gray-600">Generate your first API key to start using the API</p>
                            </div>
                        )}
                    </div>

                    {/* API Testing Section */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                            Test API Live
                        </h2>

                        {/* Select API Key */}
                        <div className="mb-6">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                1. Select API Key to Test
                            </label>
                            <select
                                value={selectedApiKey}
                                onChange={(e) => setSelectedApiKey(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                disabled={keys.filter(k => k.isActive).length === 0}
                            >
                                <option value="">-- Select an Active API Key --</option>
                                {keys.filter(k => k.isActive).map((key) => (
                                    <option key={key.keyId} value={key.apiKey}>
                                        {key.keyName || 'Unnamed'} - {key.apiKey.substring(0, 30)}...
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Query Parameters */}
                        <div className="mb-6">
                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                                2. Enter Query Parameters (Optional)
                            </label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs text-gray-600 mb-1">Province ID</label>
                                    <input
                                        type="number"
                                        value={testParams.provinceId}
                                        onChange={(e) => setTestParams({ ...testParams, provinceId: e.target.value })}
                                        placeholder="e.g., 1"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-600 mb-1">District ID</label>
                                    <input
                                        type="number"
                                        value={testParams.districtId}
                                        onChange={(e) => setTestParams({ ...testParams, districtId: e.target.value })}
                                        placeholder="e.g., 1"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-600 mb-1">Start Date</label>
                                    <input
                                        type="date"
                                        value={testParams.startDate}
                                        onChange={(e) => setTestParams({ ...testParams, startDate: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-600 mb-1">End Date</label>
                                    <input
                                        type="date"
                                        value={testParams.endDate}
                                        onChange={(e) => setTestParams({ ...testParams, endDate: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Test Button */}
                        <button
                            onClick={handleTestAPI}
                            disabled={testLoading || !selectedApiKey}
                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {testLoading ? (
                                <>
                                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Testing API...
                                </>
                            ) : (
                                <>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                    Test API Now
                                </>
                            )}
                        </button>

                        {/* Test Error */}
                        {testError && (
                            <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                                <svg className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <div>
                                    <p className="text-red-800 font-semibold">API Test Failed</p>
                                    <p className="text-red-700 text-sm mt-1">{testError}</p>
                                </div>
                            </div>
                        )}

                        {/* Test Result */}
                        {testResult && (
                            <div className="mt-4">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        API Response
                                    </h3>
                                    <button
                                        onClick={handleCopyTestResult}
                                        className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                        </svg>
                                        Copy
                                    </button>
                                </div>
                                <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto max-h-96">
                                    <pre className="text-sm text-green-400 font-mono">
                                        {JSON.stringify(testResult, null, 2)}
                                    </pre>
                                </div>
                                {testResult.data && Array.isArray(testResult.data) && (
                                    <p className="text-sm text-gray-600 mt-2">
                                        ✅ Returned <strong>{testResult.data.length}</strong> record(s)
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Example Usage */}
                    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-lg p-6 text-white">
                        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                            </svg>
                            Example API Usage (cURL)
                        </h3>
                        <div className="bg-black bg-opacity-50 rounded-lg p-4 overflow-x-auto">
                            <pre className="text-sm text-green-400 font-mono">
                                {`curl -X GET "${window.location.origin.replace(/:\d+/, ':5258')}/api/data" \\
  -H "X-API-Key: YOUR_API_KEY_HERE" \\
  -H "Content-Type: application/json" \\
  -d '{
    "provinceId": 1,
    "districtId": 1,
    "startDate": "2025-01-01",
    "endDate": "2025-01-31"
  }'`}
                            </pre>
                        </div>
                        <p className="text-gray-300 text-sm mt-4">
                            Replace <code className="bg-gray-700 px-2 py-1 rounded">YOUR_API_KEY_HERE</code> with your actual API key from the table above.
                        </p>
                    </div>

                    {/* Info Card */}
                    <div className="bg-orange-50 rounded-2xl p-6 border border-orange-200 mt-6">
                        <h3 className="font-bold text-orange-900 mb-3">🔐 API Key Security Tips</h3>
                        <ul className="space-y-2 text-sm text-orange-800">
                            <li className="flex items-start gap-2">
                                <span>•</span>
                                <span>Never share your API keys publicly or commit them to version control</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span>•</span>
                                <span>Revoke keys immediately if you suspect they've been compromised</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span>•</span>
                                <span>Use different keys for different applications or environments</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span>•</span>
                                <span>Each API call counts against your package limit ({(packageInfo?.apiCallsRemaining || 0).toLocaleString()} remaining)</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </ConsumerLayout>
    )
}
