import React, { useState } from "react";
import { modifyStateProperty } from "../../Utils/UtilsState";
import { Button, Card, Col, Form, Input, Row, Steps, Typography, Select } from "antd";
import { useNavigate } from 'react-router-dom';
import {
    allowSubmitForm,
    joinAllServerErrorMessages,
    setServerErrors,
    validateFormDataInputEmail,
    validateFormDataInputRequired
} from "../../Utils/UtilsValidations";

const { Step } = Steps;
const { Option } = Select;

const countries = ["United States", "Canada", "Mexico", "United Kingdom", "Germany", "France", "Spain", "China", "Japan", "Brazil"];

const CreateUserComponent = (props) => {
    const { openNotification } = props;
    const navigate = useNavigate();

    const requiredInForm = ["email", "password"];
    const [formErrors, setFormErrors] = useState({});
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: '',
        surname: '',
        documentIdentity: '',
        documentNumber: '',
        country: '',
        address: '',
        postalCode: '',
        birthday: ''
    });
    const [touchedFields, setTouchedFields] = useState({});
    const [currentStep, setCurrentStep] = useState(0);

    const steps = [
        {
            title: "Account",
            fields: [
                { label: "Email", name: "email", type: "text", validator: validateFormDataInputEmail },
                { label: "Password", name: "password", type: "password", validator: validateFormDataInputRequired },
            ]
        },
        {
            title: "Information",
            fields: [
                { label: "Name", name: "name", type: "text", validator: null },
                { label: "Surname", name: "surname", type: "text", validator: null },
                { label: "Document Identity", name: "documentIdentity", type: "text", validator: null },
                { label: "Document Number", name: "documentNumber", type: "text", validator: null },
                { label: "Country", name: "country", type: "select", validator: null },
            ]
        },
        {
            title: "Address",
            fields: [
                { label: "Address", name: "address", type: "text", validator: null },
                { label: "Postal Code", name: "postalCode", type: "text", validator: null },
                { label: "Birthday", name: "birthday", type: "date", validator: null },
            ]
        }
    ];

    const clickCreate = async () => {
        const cleanedData = Object.fromEntries(
            Object.entries(formData).map(([key, value]) => [key, value || null])
        );

        if (cleanedData.birthday) {
            cleanedData.birthday = new Date(cleanedData.birthday).getTime();
        }

        const response = await fetch(process.env.REACT_APP_BACKEND_BASE_URL + "/users", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(cleanedData)
        });

        if (response.ok) {
            const responseBody = await response.json();
            openNotification("top", "User registration successful", "success");
            navigate("/login");
        } else {
            const responseBody = await response.json();
            const serverErrors = responseBody.errors;
            setServerErrors(serverErrors, setFormErrors);
            const notificationMsg = joinAllServerErrorMessages(serverErrors);
            openNotification("top", notificationMsg, "error");
        }
    };

    const nextStep = () => {
        // Check required fields
        const currentStepFields = steps[currentStep].fields;
        let hasErrors = false;

        currentStepFields.forEach(field => {
            if (requiredInForm.includes(field.name) && !formData[field.name]) {
                hasErrors = true;
                setFormErrors(prevErrors => ({
                    ...prevErrors,
                    [field.name]: { msg: `${field.label} is required` }
                }));
            }
        });

        if (!hasErrors && currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        }
    };

    const previousStep = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleFieldChange = (field, value) => {
        modifyStateProperty(formData, setFormData, field.name, value);

        setTouchedFields(prev => ({ ...prev, [field.name]: true }));

        if (field.validator) {
            // Run the validator and let it manage its own error messages
            field.validator(formData, field.name, formErrors, setFormErrors);
        }
    };

    return (
        <Row align="middle" justify="center" style={{ minHeight: "80vh" }}>
            <Col xs={24} sm={24} md={16} lg={12} xl={8}>
                <Card title="Create User" style={{ margin: "15px" }}>
                    <Steps current={currentStep}>
                        {steps.map(step => (
                            <Step key={step.title} title={step.title} />
                        ))}
                    </Steps>
                    <Form layout="vertical" style={{ marginTop: "20px" }}>
                        {steps[currentStep].fields.map(field => (
                            <Form.Item
                                key={field.name}
                                label={
                                    <>
                                        {field.label}
                                        {requiredInForm.includes(field.name) && <span style={{ color: "red" }}> *</span>}
                                    </>
                                }
                                validateStatus={
                                    touchedFields[field.name] && formErrors[field.name] ? "error" : ""
                                }
                            >
                                {field.type === "select" ? (
                                    <Select
                                        showSearch
                                        placeholder={`Select your ${field.label.toLowerCase()}`}
                                        optionFilterProp="children"
                                        value={formData[field.name]}
                                        onChange={(value) => handleFieldChange(field, value)}
                                        filterOption={(input, option) =>
                                            option.children.toLowerCase().includes(input.toLowerCase())
                                        }
                                    >
                                        {countries.map(country => (
                                            <Option key={country} value={country}>{country}</Option>
                                        ))}
                                    </Select>
                                ) : (
                                    <Input
                                        type={field.type}
                                        placeholder={`Enter your ${field.label.toLowerCase()}`}
                                        value={formData[field.name]}
                                        onChange={(e) => handleFieldChange(field, e.target.value)}
                                    />
                                )}
                                {touchedFields[field.name] && formErrors[field.name]?.msg && (
                                    <Typography.Text type="danger">
                                        {formErrors[field.name].msg}
                                    </Typography.Text>
                                )}
                            </Form.Item>
                        ))}

                        <Form.Item>
                            <Button type="default" onClick={previousStep} disabled={currentStep === 0}>
                                Previous
                            </Button>
                            {currentStep < steps.length - 1 ? (
                                <Button type="primary" onClick={nextStep}>
                                    Next
                                </Button>
                            ) : (
                                <Button
                                    type="primary"
                                    onClick={clickCreate}
                                    disabled={!allowSubmitForm(formData, formErrors, requiredInForm)}
                                >
                                    Create User
                                </Button>
                            )}
                        </Form.Item>
                    </Form>
                </Card>
            </Col>
        </Row>
    );
}

export default CreateUserComponent;
