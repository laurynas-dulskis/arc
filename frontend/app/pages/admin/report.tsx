import React from "react";
import {ensureAdminAccess} from "~/utils/authUtils";
import AdminNavigationHeader from "~/components/adminNavigationHeader";
import { showToast } from "~/utils/toastUtils";
import Spinner from "~/components/spinner";
import { postGenerateReport } from "~/clients/reportsClient";

export function Reports() {
    const [isAdmin, setIsAdmin] = React.useState(false);
    const [isGenerating, setIsGenerating] = React.useState(false);

    React.useEffect(() => {
            setIsAdmin(ensureAdminAccess());
        }, []);

    const [reportType, setReportType] = React.useState('');
    const [fromDate, setFromDate] = React.useState('');
    const [toDate, setToDate] = React.useState('');
    const [errors, setErrors] = React.useState<{ [key: string]: string }>({});

    const validateAndGenerate = () => {
        const newErrors: { [key: string]: string } = {};
        if (!reportType) newErrors.reportType = "Please select a report type.";
        if (!fromDate) newErrors.fromDate = "Please select a start date.";
        if (!toDate) newErrors.toDate = "Please select an end date.";
        if (fromDate && toDate && new Date(fromDate) > new Date(toDate)) {
            newErrors.date = "Start date cannot be after end date.";
        }

        setErrors(newErrors);

        if (Object.keys(newErrors).length === 0) {

            console.log("Generating report:", { reportType, fromDate, toDate });

            setIsGenerating(true);

            postGenerateReport({ reportType, fromDate, toDate })
                .then(() => {
                    showToast("Report generation started. Check your email for the report.", "success");
                })
                .catch((err) => {
                    console.error(err);
                    showToast("Failed to generate report. Please try again later.", "error");
                }).finally(() => {
                    setIsGenerating(false);
                });

            setReportType('');
            setFromDate('');
            setToDate('');
            setErrors({});

        } else {
            showToast("Please fix the errors before generating a report.", "error");
        }
    };

    if (!isAdmin) {
        return (
            <div className="flex flex-col items-center justify-center bg-gray-50 min-h-screen">
                <Spinner />
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center bg-gray-50 min-h-screen pt-8 pb-6">
            <AdminNavigationHeader/>
            <h1 className="text-4xl font-bold text-gray-800 pb-10">Admin Reports Panel</h1>
            {isGenerating === true ? (
                <Spinner />
            ) : <div className="w-full max-w-4xl bg-white shadow-md rounded-lg p-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                    <div className="flex flex-col">
                        <label htmlFor="reportType" className="mb-2 font-semibold text-gray-700">Report Type</label>
                        <select
                            id="reportType"
                            value={reportType}
                            onChange={(e) => setReportType(e.target.value)}
                            className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700"
                        >
                            <option value="">Select a type...</option>
                            <option value="routes">Popular Routes Report</option>
                            <option value="flights">Flights Report</option>
                        </select>
                        {errors.reportType && <p className="text-red-500 text-sm mt-1">{errors.reportType}</p>}
                    </div>

                    <div className="flex flex-col">
                        <label htmlFor="fromDate" className="mb-2 font-semibold text-gray-700">Flights from</label>
                        <input
                            type="date"
                            id="fromDate"
                            value={fromDate}
                            onChange={(e) => setFromDate(e.target.value)}
                            className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700"
                        />
                        {errors.fromDate && <p className="text-red-500 text-sm mt-1">{errors.fromDate}</p>}
                    </div>

                    <div className="flex flex-col">
                        <label htmlFor="toDate" className="mb-2 font-semibold text-gray-700">Flights to</label>
                        <input
                            type="date"
                            id="toDate"
                            value={toDate}
                            onChange={(e) => setToDate(e.target.value)}
                            className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700"
                        />
                        {errors.toDate && <p className="text-red-500 text-sm mt-1">{errors.toDate}</p>}
                    </div>
                </div>

                {errors.date && <p className="text-red-500 text-sm mt-4 text-center">{errors.date}</p>}

                <div className="mt-8 flex justify-center">
                    <button
                        onClick={validateAndGenerate}
                        className="px-6 py-2 text-white font-semibold bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out"
                    >
                        Generate Report
                    </button>
                </div>
            </div>}
        
        </div>
    );
}


export default Reports;