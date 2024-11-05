import { useState, useEffect } from "react";
import { Table, Space } from 'antd';
import { Link } from "react-router-dom";
import { UserOutlined } from '@ant-design/icons';

const ListMyTransactionsComponent = () => {
    const [transactions, setTransactions] = useState([]);

    useEffect(() => {
        getMyTransactions();
    }, []);

    const getMyTransactions = async () => {
        const response = await fetch(
            process.env.REACT_APP_BACKEND_BASE_URL + "/transactions/own",
            {
                method: "GET",
                headers: {
                    "apikey": localStorage.getItem("apiKey")
                },
            }
        );

        if (response.ok) {
            let jsonData = await response.json();
            jsonData = jsonData.map(transaction => ({
                ...transaction,
                key: transaction.id, // Set a unique key for each transaction
            }));
            setTransactions(jsonData);
        } else {
            const responseBody = await response.json();
            const serverErrors = responseBody.errors;
            serverErrors.forEach(e => {
                console.log("Error: " + e.msg);
            });
        }
    };

    const columns = [
        {
            title: "Transaction ID",
            dataIndex: "id",
            sorter: (a, b) => a.id - b.id, // Sort by numeric ID
        },
        {
            title: "Buyer ID",
            dataIndex: "buyerId",
            render: (buyerId) => (
                <Link to={`/users/${buyerId}`}>
                    <UserOutlined style={{ marginRight: 8 }} />
                    {buyerId}
                </Link>
            ),
            sorter: (a, b) => a.buyerId - b.buyerId, // Sort numerically
        },
        {
            title: "Seller ID",
            dataIndex: "sellerId",
            render: (sellerId) => (
                <Link to={`/users/${sellerId}`}>
                    <UserOutlined style={{ marginRight: 8 }} />
                    {sellerId}
                </Link>
            ),
            sorter: (a, b) => a.sellerId - b.sellerId, // Sort numerically
        },
        {
            title: "Product ID",
            dataIndex: "productId",
            sorter: (a, b) => a.productId - b.productId, // Sort by numeric product ID
        },
        {
            title: "Product Price (€)",
            dataIndex: "productPrice",
            sorter: (a, b) => a.productPrice - b.productPrice, // Sort by product price
        },
        {
            title: "Start Date",
            dataIndex: "startDate",
            render: (date) => new Date(date).toLocaleDateString(),
            sorter: (a, b) => new Date(a.startDate) - new Date(b.startDate), // Sort by start date
        },
        {
            title: "End Date",
            dataIndex: "endDate",
            render: (date) => new Date(date).toLocaleDateString(),
            sorter: (a, b) => new Date(a.endDate) - new Date(b.endDate), // Sort by end date
        },
    ];

    return (
        <Table columns={columns} dataSource={transactions} />
    );
}

export default ListMyTransactionsComponent;
