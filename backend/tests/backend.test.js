// Mock των models ώστε το test να μην χρησιμοποιεί πραγματική βάση δεδομένων
jest.mock("../models/Group");
jest.mock("../models/Expense");
jest.mock("../models/User");

const Group = require("../models/Group");
const Expense = require("../models/Expense");

const {
  createGroup,
  getGroups,
} = require("../controllers/groupController");

const {
  createExpense,
} = require("../controllers/expenseController");

// Δημιουργία mock response object για να ελέγχουμε τα status και json responses
const mockResponse = () => {
  const res = {};

  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);

  return res;
};

describe("Backend Unit Tests - Groups & Expenses", () => {
  beforeEach(() => {
    // Καθαρίζει τα mocks πριν από κάθε test
    jest.clearAllMocks();
  });

  test("Create group successfully", async () => {
    // Προσομοίωση request χρήστη με έγκυρο όνομα group
    const req = {
      body: {
        name: "Trip Group",
      },
      user: {
        _id: "user123",
      },
    };

    const res = mockResponse();

    // Προσομοίωση επιτυχούς δημιουργίας group από το μοντέλο Group
    Group.create.mockResolvedValue({
      _id: "group123",
      name: "Trip Group",
    });

    // Προσομοίωση αναζήτησης του group και επιστροφής populated δεδομένων
    Group.findById.mockReturnValue({
      populate: jest.fn().mockResolvedValue({
        _id: "group123",
        name: "Trip Group",
        members: [
          {
            user: {
              _id: "user123",
              name: "Test User",
              email: "test@test.com",
            },
            status: "accepted",
          },
        ],
      }),
    });

    // Κλήση της συνάρτησης createGroup που θέλουμε να ελέγξουμε
    await createGroup(req, res);

    // Έλεγχος ότι το Group.create καλέστηκε με τα σωστά δεδομένα
    expect(Group.create).toHaveBeenCalledWith({
      name: "Trip Group",
      members: [
        {
          user: "user123",
          status: "accepted",
        },
      ],
    });

    // Έλεγχος ότι επιστρέφεται status 201, δηλαδή επιτυχής δημιουργία
    expect(res.status).toHaveBeenCalledWith(201);

    // Έλεγχος ότι επιστρέφεται απάντηση σε μορφή json
    expect(res.json).toHaveBeenCalled();
  });
});

//test 2
test("Create group fails without name", async () => {
  // Προσομοίωση request χρήστη χωρίς όνομα group
  const req = {
    body: {
      name: "",
    },
    user: {
      _id: "user123",
    },
  };

  const res = mockResponse();

  // Κλήση της συνάρτησης createGroup
  await createGroup(req, res);

  // Έλεγχος ότι επιστρέφεται status 400, δηλαδή λάθος αίτημα
  expect(res.status).toHaveBeenCalledWith(400);

  // Έλεγχος ότι επιστρέφεται το σωστό μήνυμα λάθους
  expect(res.json).toHaveBeenCalledWith({
    message: "Group name is required",
  });
});

//test 3
test("Get groups successfully", async () => {
  // Προσομοίωση συνδεδεμένου χρήστη
  const req = {
    user: {
      _id: "user123",
    },
  };

  const res = mockResponse();

  // Προσομοίωση επιστροφής ομάδων
  Group.find.mockResolvedValue([
    {
      _id: "group1",
      name: "Trip Group",
    },
    {
      _id: "group2",
      name: "Friends Group",
    },
  ]);

  // Κλήση της συνάρτησης
  await getGroups(req, res);

  // Έλεγχος ότι επιστράφηκε JSON
  expect(res.json).toHaveBeenCalled();
});

//test 4
test("Create expense successfully", async () => {
  // Προσομοίωση έγκυρου expense
  const req = {
    body: {
      groupId: "group123",
      description: "Dinner",
      totalAmount: 50,
      payer: "user123",
      splits: [
        {
          user: "user123",
          amount: 50,
        },
      ],
    },
  };

  const res = mockResponse();

  // Προσομοίωση επιτυχούς δημιουργίας expense
  Expense.create.mockResolvedValue({
    _id: "expense123",
    description: "Dinner",
    totalAmount: 50,
  });

  // Κλήση της συνάρτησης
  await createExpense(req, res);

  // Έλεγχος ότι επιστρέφεται status 201
  expect(res.status).toHaveBeenCalledWith(201);

  // Έλεγχος ότι επιστρέφεται JSON
  expect(res.json).toHaveBeenCalled();
});

//test 5
test("Create expense fails when required fields are missing", async () => {
  // Προσομοίωση expense με ελλιπή δεδομένα
  const req = {
    body: {
      description: "Dinner",
    },
  };

  const res = mockResponse();

  // Κλήση της συνάρτησης
  await createExpense(req, res);

  // Έλεγχος ότι επιστρέφεται status 400
  expect(res.status).toHaveBeenCalledWith(400);

  // Έλεγχος ότι επιστρέφεται το σωστό μήνυμα λάθους
  expect(res.json).toHaveBeenCalledWith({
    message: "Missing required fields",
  });
});