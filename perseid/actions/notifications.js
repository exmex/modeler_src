import moment from "moment-timezone";
import { v4 as uuidv4 } from "uuid";

export const ADD_NOTIFICATION = "add_notification";

export function addNotification(notification) {
  return {
    type: ADD_NOTIFICATION,
    payload: notification
  };
}

export const TYPE = {
  ERROR: "error",
  INFO: "info",
  WARNING: "warning"
};

export function addNotificationSimple(
  message,
  type,
  autohide,
  urlCaption,
  urlToOpen,
  urlIsExternal
) {
  return (dispatch, getState) =>
    dispatch(
      addNotification({
        id: uuidv4(),
        datepast: moment().startOf("minute").fromNow(),
        datesort: moment().unix(),
        date: moment().format("hh:mm:ss |  DD MMMM YYYY"),
        message,
        model: getState().model.name,
        type,
        autohide,
        urlCaption,
        urlToOpen,
        urlIsExternal
      })
    );
}
