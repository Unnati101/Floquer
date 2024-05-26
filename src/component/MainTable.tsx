import React, { useState, useEffect } from 'react';
import { Table } from 'antd';
import { ColumnsType } from 'antd/es/table';
import axios from 'axios';
import Analytics from './Analytics';
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

interface AggregatedData {
    year: number;
    total_jobs: number;
    average_salary: number;
}

const MainTable: React.FC = () => {
    const [data, setData] = useState<SalaryData[]>([]);
    const [selectedYear, setSelectedYear] = useState<number | null>(null);

    useEffect(() => {
        axios.get('http://localhost:8080/api/salaries')
            .then(response => {
                const formattedData = response.data.map((item: any) => ({
                    ...item,
                    work_year: parseInt(item.work_year, 10),
                    salary: parseFloat(item.salary),
                    salary_in_usd: parseFloat(item.salary_in_usd),
                    remote_ratio: parseInt(item.remote_ratio, 10),
                }));
                setData(formattedData);
            })
            .catch(error => console.error('Error fetching data:', error));
    }, []);

    const aggregatedData = data.reduce<Record<number, { totalJobs: number; totalSalary: number }>>((acc, curr) => {
        const { work_year, salary_in_usd } = curr;
        if (!acc[work_year]) {
            acc[work_year] = { totalJobs: 0, totalSalary: 0 };
        }
        acc[work_year].totalJobs += 1;
        acc[work_year].totalSalary += salary_in_usd;
        return acc;
    }, {});

    const tableData: AggregatedData[] = Object.entries(aggregatedData).map(([year, { totalJobs, totalSalary }]) => ({
        year: parseInt(year, 10),
        total_jobs: totalJobs,
        average_salary: Math.round(totalSalary / totalJobs),
    }));

    const columns: ColumnsType<AggregatedData> = [
        {
            title: 'Year',
            dataIndex: 'year',
            sorter: (a, b) => a.year - b.year,
        },
        {
            title: 'Number of Total Jobs',
            dataIndex: 'total_jobs',
            sorter: (a, b) => a.total_jobs - b.total_jobs,
        },
        {
            title: 'Average Salary (USD)',
            dataIndex: 'average_salary',
            sorter: (a, b) => a.average_salary - b.average_salary,
        },
    ];

    return (
        <>
            <Table
                columns={columns}
                dataSource={tableData}
                rowKey="year"
                onRow={record => ({
                    onClick: () => setSelectedYear(prevYear => prevYear === record.year ? null : record.year),
                })}
            />
            {selectedYear && <Analytics year={selectedYear} data={data} />}
        </>
    );
};

export default MainTable;
