import { Card, Col, message, Row } from 'antd';
import { Formik } from 'formik';
import { Button } from 'antd';
import {
  Form,
  FormItem,
  SubmitButton,
  InputNumber,
  Switch,
  Slider,
  Select
} from 'formik-antd';
import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import {
  fetchOptionsData,
  updateDataOption
} from '../../store/reducers/OptionsSlice';
import { isErrorDispatch, PopupError } from '../helpers/PopupError';
import { useLogOut } from '../helpers/LogOut';
import UpdateProfile from '../SidebarMenu/UpdateProfile';

interface IFormSettings {
  notification: boolean;
  notifyMinutes: number;
  notifyVolume: number;
  rateWithBalance: number;
  rateWithoutBalance: number;
  currency: string;
}

const Settings = () => {
  const {
    userId,
    notification,
    notifyMinutes,
    notifyVolume,
    rateWithBalance,
    rateWithoutBalance,
    currency,
    user
  } = useAppSelector((state) => ({
    userId: state.user.data?.id,
    currency: state.options.data?.currency || '',
    notification: state.options.data?.notification || false,
    notifyMinutes: state.options.data?.notifyMinutes || 3,
    notifyVolume: state.options.data?.notifyVolume || 100,
    rateWithBalance: state.options.data?.rateWithBalance || 0,
    rateWithoutBalance: state.options.data?.rateWithoutBalance || 0,
    user: state.user.data
  }));

  const initialValues = {
    notification: notification,
    notifyMinutes: notifyMinutes,
    notifyVolume: notifyVolume,
    rateWithBalance: rateWithBalance,
    rateWithoutBalance: rateWithoutBalance,
    currency: currency
  };

  const [loading, setLoading] = useState(false);

  const dispatch = useAppDispatch();
  const logOut = useLogOut();

  useEffect(() => {
    if (userId) {
      try {
        isErrorDispatch(dispatch(fetchOptionsData(userId)));
      } catch (err) {
        PopupError(err);
      }
    }
    // eslint-disable-next-line
  }, [userId]);

  const handleSubmit = async (values: IFormSettings) => {
    if (userId) {
      console.log(values);
      try {
        setLoading(true);
        await isErrorDispatch(
          dispatch(updateDataOption({ userId, ...values }))
        );
        message.info(`Settings updated`);
      } catch (err) {
        PopupError(err);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Formik initialValues={initialValues} onSubmit={handleSubmit}>
      {({ values, touched }) => {
        return (
          <Form className="mt-3 w-full">
            <div className="flex justify-center mt-10 gap-4 flex-wrap">
              <Card
                type="inner"
                title="Notifications"
                bordered={false}
                style={{ minWidth: 320 }}
              >
                <Row>
                  <Col className="w-3/5">
                    <p>Enable:</p>
                    <p>Notify (minutes):</p>
                    <p>Volume:</p>
                  </Col>

                  <Col className="w-2/5">
                    <p>
                      <Switch name="notification" size="small" />
                    </p>
                    <FormItem name="notifyMinutes">
                      <InputNumber
                        min={0}
                        name="notifyMinutes"
                        style={{ width: 70 }}
                        disabled={!values.notification}
                      />
                    </FormItem>
                    <Slider
                      name="notifyVolume"
                      style={{ marginTop: '-0.8rem' }}
                      disabled={!values.notification}
                    />
                  </Col>
                </Row>
              </Card>

              <Card
                type="inner"
                title="Students"
                bordered={false}
                style={{ minWidth: 320 }}
              >
                <Row>
                  <Col className="mr-1">
                    <p>Cost with balance:</p>
                    <p>Cost without balance:</p>
                    <p>Currency:</p>
                  </Col>
                  <Col>
                    <InputNumber
                      min={0}
                      name="rateWithBalance"
                      style={{ width: 80, display: 'block' }}
                    />

                    <InputNumber
                      min={0}
                      name="rateWithoutBalance"
                      style={{ width: 80, display: 'block' }}
                    />

                    <Select
                      name="currency"
                      value={values.currency}
                      style={{ width: 80, display: 'block' }}
                      className="mt-2"
                    >
                      <Select.Option value="USD">USD</Select.Option>
                      <Select.Option value="EUR">EUR</Select.Option>
                      <Select.Option value="UAH">UAH</Select.Option>
                      <Select.Option value="RUB">RUB</Select.Option>
                    </Select>
                  </Col>
                </Row>
              </Card>
              <div className="w-full flex justify-start flex-col items-center">
                <SubmitButton
                  key="submit"
                  className="w-[150px] rounded-sm"
                  loading={loading}
                  disabled={!Object.keys(touched).length}
                >
                  Save Settings
                </SubmitButton>
                <div className="text-[#1890ff] mt-3">
                  <UpdateProfile user={user} />
                </div>
                <Button type="link" onClick={logOut}>
                  Log Out
                </Button>
              </div>
            </div>
          </Form>
        );
      }}
    </Formik>
  );
};

export default Settings;
