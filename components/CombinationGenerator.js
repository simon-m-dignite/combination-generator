"use client";
import { useState } from "react";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import { useFormik } from "formik";

const validate = (values) => {
  const errors = {};

  if (!values.startValue) {
    errors.startValue = "Required";
  } else if (values.startValue < 0) {
    errors.startValue = "Value can not be less than 0.";
  }

  if (!values.endValue) {
    errors.endValue = "Required";
  } else if (values.endValue > 65) {
    errors.endValue = "Value can not be greater than 65";
  }

  if (!values.combinationSize) {
    errors.combinationSize = "Required";
  } else if (values.combinationSize > 5) {
    errors.combinationSize = "Value can not be greater than 3";
  }

  return errors;
};

const CombinationGenerator = () => {
  const [filters, setFilters] = useState({
    excludeAllEvenNumbers: false,
    excludeAllOddNumbers: false,
    excludeThreeConsecutiveNumbers: false,
    excludeThreeNumbersInRangeBetween1to9: false,
    excludeThreenumbersInRangeBetween10to19: false,
    excludeThreeNumbersInRangeBetween20to29: false,
    excludeThreeNumbersInRangeBetween30to39: false,
    excludeSameOnesDigit: false,
    excludeThreeNumbersInRangeOfFive: false,
    excludeConsecutiveCountingNumbers: false,
  });
  const [loading, setLoading] = useState(false);
  const [generateExcel, setGenerateExcel] = useState(false);

  const handleCheckboxChange = (filter) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [filter]: !prevFilters[filter],
    }));
  };

  const formik = useFormik({
    initialValues: {
      startValue: 1,
      endValue: 20,
      combinationSize: 2,
      excludedNumber: "",
    },
    validate,
    onSubmit: async (values, { resetForm }) => {
      const buttonType = values.buttonType;
      if (buttonType === "csv") {
        setLoading(true);
      } else {
        setGenerateExcel(true);
      }
      try {
        console.log("api calling");
        const res = await fetch("/api/generateCombinations", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            start: values.startValue,
            end: values.endValue,
            combinationSize: values.combinationSize,
            excludedNumber: values.excludedNumber,
            filters,
          }),
        });
        console.log("response >>>", res);

        const data = await res.json();
        console.log("data >>>", data);

        if (data) {
          const buttonType = values.buttonType;
          if (buttonType === "csv") {
            // Export to CSV
            const csvContent = data.map((combo) => combo.join(",")).join("\n");
            const blob = new Blob([csvContent], {
              type: "text/csv;charset=utf-8;",
            });
            saveAs(blob, "filtered_combinations.csv");
          } else if (buttonType === "excel") {
            // Export to Excel
            const worksheet = XLSX.utils.json_to_sheet(
              data.map((combo) => ({ Combination: combo.join(", ") }))
            );
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Combinations");
            const excelBlob = XLSX.write(workbook, {
              bookType: "xlsx",
              type: "array",
            });
            saveAs(
              new Blob([excelBlob], { type: "application/octet-stream" }),
              "filtered_combinations.xlsx"
            );
          }

          // Export to CSV
          // const csvContent = data.map((combo) => combo.join(",")).join("\n");
          // const blob = new Blob([csvContent], {
          //   type: "text/csv;charset=utf-8;",
          // });
          // saveAs(blob, "filtered_combinations.csv");
        }
        // resetForm();
      } catch (error) {
        console.error("Error generating combinations:", error);
      } finally {
        setLoading(false);
        setGenerateExcel(false);
      }
    },
  });

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center gap-4 px-4 py-10 bg-gray-50">
      <form
        onSubmit={(e) => {
          const buttonType = e.nativeEvent.submitter.name;
          formik.setFieldValue("buttonType", buttonType, false);
          formik.handleSubmit(e);
        }}
        // onSubmit={formik.handleSubmit}
        className="w-full lg:w-[45%] bg-white p-10 rounded-2xl"
      >
        <h1 className="font-semibold text-xl mb-7">Combination Generator</h1>

        {/* Start Value Input */}
        <div className="w-full flex flex-col items-start gap-1 my-3">
          <label htmlFor="startValue" className="text-sm font-medium">
            Start Value:
          </label>
          <input
            type="number"
            id="startValue"
            name="startValue"
            min={0}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.startValue}
            // value={start}
            // onChange={(e) => setStart(parseInt(e.target.value, 10))}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 outline-blue-500 focus:border-blue-500 focus:bg-white block w-full p-2.5"
          />
          {formik.errors.startValue ? (
            <div className="text-xs font-medium text-red-500">
              {formik.errors.startValue}
            </div>
          ) : null}
        </div>

        {/* End Value Input */}
        <div className="w-full flex flex-col items-start gap-1 my-3">
          <label htmlFor="endValue" className="text-sm font-medium">
            End Value:
          </label>
          <input
            type="number"
            id="endValue"
            name="endValue"
            min={1}
            max={65}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.endValue}
            // value={end}
            // onChange={(e) => setEnd(parseInt(e.target.value, 10))}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 outline-blue-500 focus:border-blue-500 focus:bg-white block w-full p-2.5"
          />
          {formik.errors.endValue ? (
            <div className="text-xs font-medium text-red-500">
              {formik.errors.endValue}
            </div>
          ) : null}
        </div>

        {/* Combination Size Input */}
        <div className="w-full flex flex-col items-start gap-1 my-3">
          <label htmlFor="combinationSize" className="text-sm font-medium">
            Combination Size:
          </label>
          <input
            type="number"
            id="combinationSize"
            name="combinationSize"
            min={1}
            max={5}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.combinationSize}
            // value={combinationSize}
            // onChange={(e) => setCombinationSize(parseInt(e.target.value, 10))}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 outline-blue-500 focus:border-blue-500 focus:bg-white block w-full p-2.5"
          />
          {formik.errors.combinationSize ? (
            <div className="text-xs font-medium text-red-500">
              {formik.errors.combinationSize}
            </div>
          ) : null}
        </div>

        {/* Excluded Number Input */}
        <div className="w-full flex flex-col items-start gap-1 my-3">
          <label htmlFor="excludedNumber" className="text-sm font-medium">
            Exclude Number:
          </label>
          <input
            type="number"
            id="excludedNumber"
            name="excludedNumber"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.excludedNumber}
            // value={excludedNumber}
            // onChange={(e) => setExcludedNumber(e.target.value)}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 outline-blue-500 focus:border-blue-500 focus:bg-white block w-full p-2.5"
          />
          {formik.errors.excludedNumber ? (
            <div className="text-xs font-medium text-red-500">
              {formik.errors.excludedNumber}
            </div>
          ) : null}
        </div>

        {/* Filters Section */}
        <h3 className="text-xl font-semibold mb-4 mt-8">Apply Filters</h3>
        <div className="w-full">
          {Object.keys(filters).map((filterKey) => {
            const labels = {
              excludeAllEvenNumbers:
                "Exclude combinations that are all even numbers",
              excludeAllOddNumbers:
                "Exclude combinations that are all odd numbers",
              excludeThreeConsecutiveNumbers:
                "Exclude all combinations that contain 3 or more consecutive numbers",
              excludeThreeNumbersInRangeBetween1to9:
                "Exclude all combinations that contain 3 or more numbers between 1 and 9",
              excludeThreenumbersInRangeBetween10to19:
                "Exclude all combinations that contain 3 or more numbers between 10-19",
              excludeThreeNumbersInRangeBetween20to29:
                "Exclude all combinations that contain 3 or more numbers between 20-29",
              excludeThreeNumbersInRangeBetween30to39:
                "Exclude all combinations that contain 3 or more numbers between 30-39",
              excludeSameOnesDigit:
                "Exclude all combinations that contain 3 or more numbers with the same digit in the ones place (e.g., 7, 17, 27, etc.)",
              excludeThreeNumbersInRangeOfFive:
                "Exclude all combinations that contain 3 numbers within any range of 5 consecutive numbers",
              excludeConsecutiveCountingNumbers:
                "Exclude combinations that contain 2 or more consecutive counting numbers", // New rule label
            };

            const filterLabel = labels[filterKey] || filterKey;

            return (
              <div key={filterKey} className="my-2">
                <label className="flex items-start justify-start gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={filters[filterKey]}
                    onChange={() => handleCheckboxChange(filterKey)}
                    className="w-3.5 h-3.5 border mt-0.5 border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-blue-300"
                  />
                  {filterLabel}
                </label>
              </div>
            );
          })}
        </div>

        {/* Generate Buttons */}
        <div className="w-full mt-4 flex gap-4">
          <button
            type="submit"
            name="csv"
            id="csv"
            className="text-white bg-blue-500 hover:bg-blue-600 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center"
          >
            {loading ? "Loading..." : "Generate and Download CSV"}
          </button>
          <button
            type="submit"
            name="excel"
            id="excel"
            className="text-white bg-green-500 hover:bg-green-600 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center"
          >
            {generateExcel ? "Loading..." : "Generate and Download Excel"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CombinationGenerator;
