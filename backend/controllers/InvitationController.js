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

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: 'Η ομάδα δεν βρέθηκε.' });

    // Βρίσκουμε τον χρήστη μέσα στο array members του group
    const memberIndex = group.members.findIndex(
      (m) => m.user.toString() === userId.toString()
    );

    if (memberIndex === -1) {
      return res.status(403).json({ message: 'Δεν έχετε πρόσκληση για αυτή την ομάδα.' });
    }

    // Αλλάζουμε το status σε 'accepted'
    group.members[memberIndex].status = 'accepted';
    await group.save();

    //Ενημερώνουμε και τον πίνακα groups του User
    const user = await User.findById(userId);
    if (user && !user.groups.includes(groupId)) {
      user.groups.push(groupId);
      await user.save();
    }

    // Κάνουμε Update (ή διαγράφουμε) τα σχετικά notifications
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

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: 'Η ομάδα δεν βρέθηκε.' });

    // Αφαιρούμε τον χρήστη από το array members
    group.members = group.members.filter(
      (m) => m.user.toString() !== userId.toString()
    );
    await group.save();

    const user = await User.findById(userId);
    if (user) {
      user.groups = user.groups.filter(g => g.toString() !== groupId.toString());
      await user.save();
    }

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