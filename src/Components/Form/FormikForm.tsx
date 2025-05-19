import React from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import type { FormikProps } from 'formik'

interface FormikFormProps<T extends Yup.Maybe<Yup.AnyObject>> {
    initialValues: T;
    validationSchema: Yup.ObjectSchema<T>;
    onSubmit: (values: T) => void;
    children: (props: FormikProps<T>) => React.ReactNode;
}

const FormikForm = <T extends object>({
    initialValues,
    validationSchema,
    onSubmit,
    children,
}: FormikFormProps<T>) => {
    return (
        <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={onSubmit}
        >
            {(formikProps: any) => (
                <Form className="max-w-md mx-auto bg-white space-y-4">
                    {children(formikProps)}
                </Form>
            )}
        </Formik>
    );
};

export default FormikForm;
