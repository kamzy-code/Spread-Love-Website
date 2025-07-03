import { AlertCircle, Calendar, CheckCircle, XCircle } from "lucide-react";  
  
  export const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case "rescheduled":
        return <Calendar className="h-5 w-5 text-blue-500" />;
      case "successful":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "rejected":
      case "unsuccessful":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  export const getStatusColor = (status: string, useCase?: string) => {
    switch (status) {
      case "pending":
        return `${useCase === "badge" ? "bg-yellow-100" : ""} text-yellow-800`;
      case "rescheduled":
        return `${useCase === "badge" ? "bg-blue-100" : ""} text-blue-800`;
      case "successful":
        return `${useCase === "badge" ? "bg-green-100" : ""} text-green-800`;
      case "rejected":
      case "unsuccessful":
        return `${useCase === "badge" ? "bg-red-100" : ""} text-red-800`;
      default:
        return `${useCase === "badge" ? "bg-gray-100" : ""} text-gray-800`;
    }
  };