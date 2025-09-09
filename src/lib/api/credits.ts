import axios from "axios";

export const fetchUserCredits = async (userID: number) => {
  try {
    const res = await axios.get(
      `http://localhost/KindLoop-project01/Backend/get_credits.php?userID=${userID}`
    );

    if (res.data.status === "success") {
      return res.data.data; // return the data to caller
    } else {
      console.error(res.data.message);
      return null;
    }
  } catch (error) {
    console.error("Failed to fetch credits", error);
    return null;
  }
};
