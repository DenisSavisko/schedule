import { EditOutlined } from '@ant-design/icons';
import {
  Button,
  message,
  Modal,
  Radio,
  RadioChangeEvent,
  Select,
  Space,
  TimePicker
} from 'antd';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { createLesson } from '../../store/reducers/LessonActions';
import { PopupError } from '../helpers/PopupError';
import { Round } from '../Students/Students';

const { Option } = Select;

interface AddLessonProps {
  day: moment.Moment;
}

const AddLesson = (props: AddLessonProps) => {
  const { day } = props;
  const { students, userId, lessons, lessonssLoading, disciplines } =
    useAppSelector((state) => ({
      students: state.student.data,
      userId: state.user.data?.id,
      lessons: state.lessons.data,
      lessonssLoading: state.lessons.isLoading,
      disciplines: state.discipline.data
    }));

  const dayLessons = lessons?.filter(
    (item) => moment(item.date).date() === day.date()
  );
  const dispatch = useAppDispatch();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [time, setTime] = useState<moment.Moment>(moment());
  const [activeStudent, setActiveStudent] = useState<number | null>(null);
  const [activeDiscipline, setActiveDiscipline] = useState<number | null>(null);

  useEffect(() => {
    if (dayLessons) {
      const lastLessonDate =
        dayLessons.length && moment(dayLessons[dayLessons.length - 1].date);
      const date = moment(
        lastLessonDate
          ? lastLessonDate
          : moment(day).set('hours', moment().hours())
      ).add(1, 'hours');
      setTime(date.hour() === 0 ? date.subtract(1, 'hour') : date);
    }
    // eslint-disable-next-line
  }, [isModalVisible]);

  const handleAdd = async () => {
    try {
      if (!activeStudent || !userId) return;
      if (dayLessons.some((lesson) => moment(lesson.date).isSame(time))) {
        throw new Error(`Time ${time.format('HH:mm [in] ddd')} is busy`);
      }
      const response = await dispatch(
        createLesson({
          date: time,
          studentId: activeStudent,
          userId
        })
      );

      if (response.hasOwnProperty('error'))
        throw new Error(JSON.stringify(response.payload));
      setActiveStudent(null);
      setIsModalVisible(false);
      message.success('New lesson added successful!');
    } catch (err) {
      PopupError(err);
    }
  };

  const onChangeDiscipline = (e: RadioChangeEvent) => {
    // console.log('radio checked', e.target.value);
    setActiveDiscipline(e.target.value);
  };

  return (
    <>
      <EditOutlined key="edit" onClick={() => setIsModalVisible(true)} />
      <Modal
        title={day.format('dddd, DD.MM.YYYY')}
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        okButtonProps={{ style: { display: 'none' } }}
      >
        <div className="flex justify-center">
          <TimePicker
            format={'HH:mm'}
            minuteStep={15}
            value={time}
            onSelect={(t) => setTime(t)}
          />

          <Select
            showSearch
            placeholder="Select a student"
            optionFilterProp="children"
            onChange={(id) => setActiveStudent(id)}
            value={activeStudent}
          >
            {students &&
              students
                .filter((student) => !student.break)
                .map((student) => {
                  return (
                    <Option key={student.id} value={student.id}>
                      {
                        <div className="flex items-center">
                          <LittleRound color={student.color} />
                          <div>
                            {student.name} {student.surname}
                          </div>
                        </div>
                      }
                    </Option>
                  );
                })}
          </Select>
          <Button type="primary" onClick={handleAdd} loading={lessonssLoading}>
            Add
          </Button>
        </div>
        <div className="flex justify-start mt-2">
          <Radio.Group
            onChange={onChangeDiscipline}
            value={activeDiscipline || -1}
          >
            <Space direction="vertical">
              <Radio value={-1} defaultChecked>
                General
              </Radio>
              {disciplines.map((item) => (
                <Radio key={item.id} value={item.id}>
                  {item.title}
                </Radio>
              ))}
            </Space>
          </Radio.Group>
        </div>
      </Modal>
    </>
  );
};

export default AddLesson;

export const LittleRound = styled(Round)`
  width: 8px;
  height: 8px;
  margin-right: 3px;
`;
