import React, { useMemo } from 'react';
import { Table } from 'antd';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './style.css';

interface SalaryData {
    work_year: number;
    experience_level: string;
    employment_type: string;
    job_title: string;
    salary: number;
    salary_currency: string;
    salary_in_usd: number;
    employee_residence: string;
    remote_ratio: number;
    company_location: string;
    company_size: string;
}

interface AnalyticsProps {
    year: number;
    data: SalaryData[];
}

interface JobData {
    title: string;
    count: number;
}

const Analytics: React.FC<AnalyticsProps> = ({ year, data }) => {
    const salaryData = useMemo(() => {
        const dataByYear = data.reduce<Record<number, { totalJobs: number; totalSalary: number }>>((acc, curr) => {
            const { work_year, salary_in_usd } = curr;
            if (!acc[work_year]) {
                acc[work_year] = { totalJobs: 0, totalSalary: 0 };
            }
            acc[work_year].totalJobs += 1;
            acc[work_year].totalSalary += salary_in_usd;
            return acc;
        }, {});

        return Object.entries(dataByYear).map(([year, { totalJobs, totalSalary }]) => ({
            year: parseInt(year, 10),
            total_jobs: totalJobs,
            average_salary: Math.round(totalSalary / totalJobs),
        }));
    }, [data]);

    const jobData = useMemo(() => {
        return data
            .filter(item => item.work_year === year)
            .reduce<Record<string, number>>((acc, curr) => {
                const { job_title } = curr;
                if (!acc[job_title]) {
                    acc[job_title] = 0;
                }
                acc[job_title] += 1;
                return acc;
            }, {});
    }, [year, data]);

    const jobDataArray = useMemo(() => {
        return Object.entries(jobData).map(([title, count]) => ({
            title,
            count,
        }));
    }, [jobData]);

    const columns = [
        {
            title: 'Job Title',
            dataIndex: 'title',
        },
        {
            title: 'Number of Jobs',
            dataIndex: 'count',
        },
    ];

    return (
        <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={salaryData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="total_jobs" stroke="#ff7300" strokeWidth={3} activeDot={{ r: 8 }} />
                    <Line type="monotone" dataKey="average_salary" stroke="#387908" strokeWidth={3} activeDot={{ r: 8 }} />
                </LineChart>
            </ResponsiveContainer>
            <Table columns={columns} dataSource={jobDataArray} rowKey="title" />
        </div>
    );
};

export default Analytics;
