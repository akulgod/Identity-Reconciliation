import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Contact } from "../entities/Contact";

export const identifyContact = async (req: Request, res: Response) => {
  const { email, phoneNumber } = req.body;

  if (!email && !phoneNumber) {
    return res.status(400).json({ error: "Email or phone number must be provided." });
  }

  const contactRepository = AppDataSource.getRepository(Contact);

  // Find existing contacts by email or phone number
  const contacts = await contactRepository.find({
    where: [
      { email: email },
      { phoneNumber: phoneNumber }
    ]
  });

  if (contacts.length === 0) {
    // Create a new primary contact if none exists
    const newContact = new Contact();
    newContact.email = email;
    newContact.phoneNumber = phoneNumber;
    newContact.linkPrecedence = "primary";
    const savedContact = await contactRepository.save(newContact);

    return res.json({
      contact: {
        primaryContactId: savedContact.id,
        emails: [savedContact.email],
        phoneNumbers: [savedContact.phoneNumber],
        secondaryContactIds: []
      }
    });
  }

  // Find primary contact among the existing ones
  let primaryContact = contacts.find(contact => contact.linkPrecedence === "primary");
  if (!primaryContact) {
    primaryContact = contacts[0];
    primaryContact.linkPrecedence = "primary";
    await contactRepository.save(primaryContact);
  }

  // Create secondary contacts if needed
  let secondaryContacts = contacts.filter(contact => contact.id !== primaryContact.id);
  if (!secondaryContacts.some(contact => contact.email === email && contact.phoneNumber === phoneNumber)) {
    const newSecondaryContact = new Contact();
    newSecondaryContact.email = email;
    newSecondaryContact.phoneNumber = phoneNumber;
    newSecondaryContact.linkPrecedence = "secondary";
    newSecondaryContact.linkedId = primaryContact.id;
    const savedSecondaryContact = await contactRepository.save(newSecondaryContact);
    secondaryContacts.push(savedSecondaryContact);
  }

  //Sets help to avoid duplicate data
  const emailSet = new Set([primaryContact.email, ...secondaryContacts.map(contact => contact.email)].filter(Boolean));
  const phoneNumberSet = new Set([primaryContact.phoneNumber, ...secondaryContacts.map(contact => contact.phoneNumber)].filter(Boolean));

  const allEmails = Array.from(emailSet);
  const allPhoneNumbers = Array.from(phoneNumberSet);
  const secondaryContactIds = secondaryContacts.map(contact => contact.id);

  res.json({
    contact: {
      primaryContactId: primaryContact.id,
      emails: allEmails,
      phoneNumbers: allPhoneNumbers,
      secondaryContactIds: secondaryContactIds
    }
  });
};
