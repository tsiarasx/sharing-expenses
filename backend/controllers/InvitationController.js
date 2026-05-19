const Group = require('../models/Group');
const User = require('../models/User');
const Notification = require('../models/Notification');

// Αποστολή Πρόσκλησης
const sendInvitation = async (req, res) => {
  try {
    const { groupId, receiverEmail } = req.body;

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: 'Η ομάδα δεν βρέθηκε.' });

    const receiver = await User.findOne({ email: receiverEmail });
    if (!receiver) return res.status(404).json({ message: 'Δεν βρέθηκε χρήστης με αυτό το email.' });

    // Ελέγχουμε αν ο χρήστης είναι ήδη μέλος (invited ή accepted)
    const isAlreadyMember = group.members.some(
      (m) => m.user.toString() === receiver._id.toString()
    );

    if (isAlreadyMember) {
      return res.status(400).json({ message: 'Ο χρήστης είναι ήδη μέλος ή έχει ήδη προσκληθεί.' });
    }

    // Προσθέτουμε τον χρήστη στο Group με status 'invited'
    group.members.push({
      user: receiver._id,
      status: 'invited'
    });
    await group.save();

    // Καθαρίζουμε τα Notifications του, με βάση το πεδίο relatedGroup
    await Notification.deleteMany({ 
      user: receiver._id, 
      relatedGroup: group._id, 
      type: 'invitation' 
    });

    // Δημιουργούμε Notification με πεδίο relatedGroup
    await Notification.create({
      user: receiver._id,
      message: `Σας προσκάλεσαν στην ομάδα: ${group.name}`,
      type: 'invitation',
      relatedGroup: group._id
    });

    res.status(200).json({ message: 'Η πρόσκληση στάλθηκε επιτυχώς!' });
  } catch (error) {
    console.error("SEND INVITE ERROR:", error);
    res.status(500).json({ message: 'Σφάλμα διακομιστή κατά την αποστολή.' });
  }
};

// 2. Αποδοχή Πρόσκλησης
const acceptInvitation = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user._id;

    // Atomic update: set the specific member's status to 'accepted'
    const group = await Group.findOneAndUpdate(
      { _id: groupId, 'members.user': userId },
      { $set: { 'members.$.status': 'accepted' } },
      { new: true }
    );

    if (!group) {
      const groupExists = await Group.findById(groupId);
      if (!groupExists) {
        return res.status(404).json({ message: 'Η ομάδα δεν βρέθηκε.' });
      }
      return res.status(403).json({ message: 'Δεν έχετε πρόσκληση για αυτή την ομάδα.' });
    }

    // $addToSet avoids duplicates and handles ObjectId/string casting correctly
    await User.findByIdAndUpdate(
      userId,
      { $addToSet: { groups: groupId } }
    );

    // Κάνουμε Update τα σχετικά notifications
    await Notification.updateMany(
      { user: userId, relatedGroup: groupId, type: 'invitation' },
      { $set: { isRead: true } }
    );

    res.status(200).json({ message: 'Η πρόσκληση έγινε αποδεκτή!', group });
  } catch (error) {
    console.error("ACCEPT INVITE ERROR:", error);
    res.status(500).json({ message: 'Σφάλμα διακομιστή κατά την αποδοχή.' });
  }
};

// 3. Απόρριψη Πρόσκλησης
const rejectInvitation = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user._id;

    // Atomic update: remove the user from members array
    const group = await Group.findByIdAndUpdate(
      groupId,
      { $pull: { members: { user: userId } } },
      { new: true }
    );

    if (!group) {
      return res.status(404).json({ message: 'Η ομάδα δεν βρέθηκε.' });
    }

    // Remove from user's groups array if present
    await User.findByIdAndUpdate(
      userId,
      { $pull: { groups: groupId } }
    );

    // Σβήνουμε το notification
    await Notification.updateMany(
      { user: userId, relatedGroup: groupId, type: 'invitation' },
      { $set: { isRead: true } }
    );

    res.status(200).json({ message: 'Η πρόσκληση απορρίφθηκε.' });
  } catch (error) {
    console.error("REJECT INVITE ERROR:", error);
    res.status(500).json({ message: 'Σφάλμα διακομιστή.' });
  }
};

module.exports = {
  sendInvitation,
  acceptInvitation,
  rejectInvitation,
};