import { useState, useEffect } from "react";
import { Table, Space } from 'antd';
import { Link } from "react-router-dom";
import { timestampToString } from "../../Utils/UtilsDates";

const ListMyTransactionsComponent = () => {
    let [transactions, setTransactions] = useState([]);

    useEffect(() => {
        getMyTransactions();
    }, []);

    let getMyTransactions = async () => {
        let response = await fetch(
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
            jsonData.map(transaction => {
                transaction.key = transaction.id; // Set a unique key for each transaction
                return transaction;
            });
            setTransactions(jsonData);
        } else {
            let responseBody = await response.json();
            let serverErrors = responseBody.errors;
            serverErrors.forEach(e => {
                console.log("Error: " + e.msg);
            });
        }
    };

    let columns = [
        {
            title: "Transaction ID",
            dataIndex: "id",
        },
        {
            title: "Buyer ID",
            dataIndex: "buyerId"
        },
        {
            title: "Seller ID",
            dataIndex: "sellerId"
        },
        {
            title: "Product ID",
            dataIndex: "productId"
        },
        {
            title: "Product Price (€)",
            dataIndex: "productPrice",
        },
        {
            title: "Start Date",
            dataIndex: "startDate",
            render: (date) => timestampToString(date) // Assuming timestampToString can convert the date
        },
        {
            title: "End Date",
            dataIndex: "endDate",
            render: (date) => timestampToString(date) // Render end date
        },
        {
            title: "Actions",
            dataIndex: "id",
            render: (id) =>
                <Space.Compact direction="vertical">
                    <Link to={`/transactions/${id}`}>View Details</Link>
                </Space.Compact>
        },
    ];

    return (
        <Table columns={columns} dataSource={transactions} />
    );
}

export default ListMyTransactionsComponent;
