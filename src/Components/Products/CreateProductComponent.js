import { useState } from "react";
import { modifyStateProperty } from "../../Utils/UtilsState";
import { Card, Input, Button, Row, Col, Form, Upload, Select, Typography } from "antd";
import { useNavigate } from "react-router-dom";
import { validateFormDataInputRequired, allowSubmitForm, setServerErrors } from "../../Utils/UtilsValidations";
import { useSelector, useDispatch } from "react-redux";
import { actions } from "../../Reducers/reducerCountSlice";
import {categories} from "../../Utils/UtilsCategories"

const { Option } = Select;
const { Text } = Typography;

let CreateProductComponent = () => {
    const navigate = useNavigate();


    let [formData, setFormData] = useState({});
    let [formErrors, setFormErrors] = useState({}); // State for validation errors

    const requiredInputs = ["title", "price", "image"]; // Include image as required

    let validateFields = () => {
        let valid = true;

        // Validate each required field
        valid &= validateFormDataInputRequired(formData, "title", formErrors, setFormErrors);
        valid &= validateFormDataInputRequired(formData, "price", formErrors, setFormErrors);
        valid &= validateFormDataInputRequired(formData, "image", formErrors, setFormErrors);

        // Additional validation logic
        if (formData.title && formData.title.length < 5) {
            formErrors["title"] = { msg: "Title is too short" };
            setFormErrors({ ...formErrors });
            valid = false;
        }

        // Price validation as a number
        if (formData.price && isNaN(formData.price)) {
            formErrors["price"] = { msg: "Price is not a number" };
            setFormErrors({ ...formErrors });
            valid = false;
        }

        // Image validation (ensure an image file is selected)
        if (!formData.image) {
            formErrors["image"] = { msg: "Image is required" };
            setFormErrors({ ...formErrors });
            valid = false;
        }

        return valid;
    };

    let clickCreateProduct = async () => {
        if (!validateFields() || !allowSubmitForm(formData, formErrors, requiredInputs)) {
            return; // Stop if validation fails
        }

        // Submit product data if validation passes
        let response = await fetch(
            process.env.REACT_APP_BACKEND_BASE_URL + "/products", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "apikey": localStorage.getItem("apiKey")
                },
                body: JSON.stringify(formData)
            });

        if (response.ok) {
            let data = await response.json();
            await uploadImage(data.productId);
            navigate("/products");
        } else {
            let responseBody = await response.json();
            setServerErrors(responseBody.errors, setFormErrors);
        }
    };

    let uploadImage = async (productId) => {
        let formDataPhotos = new FormData();
        formDataPhotos.append('image', formData.image);
        formDataPhotos.append('productId', productId);

        let response = await fetch(
            process.env.REACT_APP_BACKEND_BASE_URL + "/products/" + productId + "/image", {
                method: "POST",
                headers: {
                    "apikey": localStorage.getItem("apiKey")
                },
                body: formDataPhotos
            });
        if (!response.ok) {
            let responseBody = await response.json();
            setServerErrors(responseBody.errors, setFormErrors);
        }
    };

    return (
        <Row align="middle" justify="center" style={{ minHeight: "70vh" }}>
            <Col>
                <Card title="Create product" style={{ width: "500px" }}>
                    <Form layout="vertical">
                        <Form.Item label="Title" labelCol={{ span: 24 }} wrapperCol={{ span: 24 }}>
                            <Input
                                onChange={(i) => modifyStateProperty(formData, setFormData, "title", i.currentTarget.value)}
                                size="large"
                                type="text"
                                placeholder="Product title"
                            />
                            {formErrors["title"] && (
                                <Text type="danger">
                                    {formErrors["title"].msg}
                                </Text>
                            )}
                        </Form.Item>

                        <Form.Item label="Description" labelCol={{ span: 24 }} wrapperCol={{ span: 24 }}>
                            <Input
                                onChange={(i) => modifyStateProperty(formData, setFormData, "description", i.currentTarget.value)}
                                size="large"
                                type="text"
                                placeholder="Description"
                            />
                        </Form.Item>

                        <Form.Item label="Price" labelCol={{ span: 24 }} wrapperCol={{ span: 24 }}>
                            <Input
                                onChange={(i) => modifyStateProperty(formData, setFormData, "price", i.currentTarget.value)}
                                size="large"
                                type="number"
                                placeholder="Price"
                            />
                            {formErrors["price"] && (
                                <Text type="danger">
                                    {formErrors["price"].msg}
                                </Text>
                            )}
                        </Form.Item>

                        <Form.Item label="Category" labelCol={{ span: 24 }} wrapperCol={{ span: 24 }}>
                            <Select
                                placeholder="Select a category"
                                onChange={(value) => modifyStateProperty(formData, setFormData, "category", value)}
                                size="large"
                            >
                                {categories.map((category) => (
                                    <Option key={category} value={category}>{category}</Option>
                                ))}
                            </Select>
                        </Form.Item>

                        <Form.Item name="image" label="Image" labelCol={{ span: 24 }} wrapperCol={{ span: 24 }}>
                            <Upload
                                maxCount={1}
                                beforeUpload={(file) => modifyStateProperty(formData, setFormData, "image", file)}
                                listType="picture-card"
                            >
                                Upload
                            </Upload>
                            {formErrors["image"] && (
                                <Text type="danger">
                                    {formErrors["image"].msg}
                                </Text>
                            )}
                        </Form.Item>

                        <Form.Item wrapperCol={{ span: 24 }}>
                            <Button type="primary" block onClick={clickCreateProduct}>Sell Product</Button>
                        </Form.Item>
                    </Form>
                </Card>
            </Col>
        </Row>
    );
};

export default CreateProductComponent;
