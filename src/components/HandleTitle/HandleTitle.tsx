import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Helmet } from "react-helmet";

const TITLES = {
  HOME: {
    arText: "الرئيسية - GIVC RCM",
    enText: "Home - GIVC RCM",
  },
  ITEMS: {
    arText: "العناصر - GIVC RCM",
    enText: "Items - GIVC RCM",
  },
  ITEM_PRICE: {
    arText: "أسعار العناصر - GIVC RCM",
    enText: "Item Price - GIVC RCM",
  },
  CODE: {
    arText: "الرموز - GIVC RCM",
    enText: "Code - GIVC RCM",
  },

  SYSTEM_RULES: {
    arText: " الاعدادات - GIVC RCM",
    enText: "Setting - GIVC RCM",
  },
  USER: {
    arText: "المستخدمين - GIVC RCM",
    enText: "Users - GIVC RCM",
  },
  PAYERS: {
    arText: "المتعهدين - GIVC RCM",
    enText: "Payers - GIVC RCM",
  },
  LOGIN: {
    arText: "تسجيل الدخول - GIVC RCM",
    enText: "Login - GIVC RCM",
  },
  PATIENT: {
    arText: "المرضى - GIVC RCM",
    enText: "Patients - GIVC RCM",
  },
  RESOURCES: {
    arText: "الترجمه - GIVC RCM",
    enText: "Resources - GIVC RCM",
  },
  FORGOT_PASSWORD: {
    arText: "نسيت كلمة المرور - GIVC RCM",
    enText: "Forgot Password - GIVC RCM",
  },
  RESET_PASSWORD: {
    arText: "إعادة تعيين كلمة المرور - GIVC RCM",
    enText: "Reset Password - GIVC RCM",
  },
  CHANGE_PASSWORD: {
    arText: "تغيير كلمة المرور - GIVC RCM",
    enText: "Change Password - GIVC RCM",
  },
  HELP_MANAGEMENT: {
    arText: "إدارة المساعدة - GIVC RCM",
    enText: "Help Management - GIVC RCM",
  },

  BED_CLASSES: {
    arText: "فئات الأسرة - GIVC RCM",
    enText: "Bed Classes - GIVC RCM",
  },
  ORDER: {
    arText: "الطلبات - GIVC RCM",
    enText: "Order - GIVC RCM",
  },
  PATIENT_EPISODE: {
    arText: "ملف المريض - GIVC RCM",
    enText: "Patient Episode - GIVC RCM",
  },
  INVOICES: {
    arText: "الفواتير - GIVC RCM",
    enText: "Invoices - GIVC RCM",
  },
  PAYMENT: {
    arText: "الدفع - GIVC RCM",
    enText: "Payment - GIVC RCM",
  },

  PATIENT_ACCOUNT: {
    arText: "حساب المريض - GIVC RCM",
    enText: "Patient Account - GIVC RCM",
  },
  EMPLOYEE: {
    arText: "الموظف - GIVC RCM",
    enText: "Employee - GIVC RCM",
  },
  CODE_MAPPING: {
    arText: "تعيين الرموز - GIVC RCM",
    enText: "Code Mapping - GIVC RCM",
  },
  ITEM_GROUP: {
    arText: "مجموعة العناصر - GIVC RCM",
    enText: "Item Group - GIVC RCM",
  },
  PACKAGE_SETUP: {
    arText: "إعداد الحزم - GIVC RCM",
    enText: "Package Setup - GIVC RCM",
  },
  PACKAGE_SET_UP: {
    arText: "إعداد الحزم - GIVC RCM",
    enText: "Package Setup - GIVC RCM",
  },

  FEEDBACK_ADMIN: {
    arText: "إدارة الملاحظات - GIVC RCM",
    enText: "Feedback Management - GIVC RCM",
  },
  USER_FEEDBACK: {
    arText: "ملاحظات المستخدم - GIVC RCM",
    enText: "User Feedback - GIVC RCM",
  },
  HELP: {
    arText: "المساعدة - GIVC RCM",
    enText: "Help - GIVC RCM",
  },
  FACILITY_MANAGEMENT: {
    arText: "إدارة المنشأة - GIVC RCM",
    enText: "Facility Management - GIVC RCM",
  },
  JOBS: {
    arText: "الوظائف - GIVC RCM",
    enText: "Jobs - GIVC RCM",
  },
};

export default function HandleTitle({
  titleKey = "HOME",
}: {
  titleKey: string;
}) {
  const { direction } = useSelector((state: any) => state.theme);
  const [directionLocal, setDirectionLocal] = useState();
  const entry = (TITLES as any)[titleKey];
  const [title, setTitle] = useState<string>(entry ? entry.enText : "GIVC RCM");

  useEffect(() => {
    const current = (TITLES as any)[titleKey];
    if (!current) {
      setTitle("GIVC RCM");
      return;
    }
    if (direction === directionLocal) {
      return;
    }
    setTitle(direction === "rtl" ? current.arText : current.enText);
    setDirectionLocal(direction);
  }, [direction, titleKey]);
  return (
    <Helmet>
      <title>{title}</title>
    </Helmet>
  );
}
