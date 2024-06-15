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

  let primaryContact: Contact | undefined;
  let secondaryContacts: Contact[] = [];

  if (contacts.length > 0) {
    primaryContact = contacts.find(contact => contact.linkPrecedence === "primary");
    
    //If the primary contact is not found, we traverse up until the primary contact is found
    if (!primaryContact) {
      let tempContact: Contact | null;
      tempContact = contacts[0];
      while (tempContact!.linkPrecedence != "primary" && tempContact!.linkedId != undefined){
        tempContact = await contactRepository.findOne({
          where: [{id: tempContact!.linkedId}]
        });
      }
      primaryContact = tempContact!;
    }

    secondaryContacts = contacts.filter(contact => contact.id !== primaryContact!.id);

    // If more than one primary contact for the same email id or number, update one to secondary
    if (contacts.filter(contact => contact.linkPrecedence === "primary").length > 1){
      for (const contact of contacts) {
        if (contact.linkPrecedence === "primary" && (contact.email !== email || contact.phoneNumber !== phoneNumber) && contact.id != primaryContact.id) {
          contact.linkPrecedence = "secondary";
          contact.linkedId = primaryContact.id;
          await contactRepository.save(contact);
        }
      }
    }
    else{
      secondaryContacts = contacts.filter(contact => contact.id !== primaryContact!.id);
      if (!secondaryContacts.some(contact => contact.email === email && contact.phoneNumber === phoneNumber)) {
        const newSecondaryContact = new Contact();
        newSecondaryContact.email = email;
        newSecondaryContact.phoneNumber = phoneNumber;
        newSecondaryContact.linkPrecedence = "secondary";
        newSecondaryContact.linkedId = primaryContact.id;
        const savedSecondaryContact = await contactRepository.save(newSecondaryContact);
        secondaryContacts.push(savedSecondaryContact);
        }
      } 
  } else {

    // Create a new primary contact if none exists
    primaryContact = new Contact();
    primaryContact.email = email;
    primaryContact.phoneNumber = phoneNumber;
    primaryContact.linkPrecedence = "primary";
    primaryContact = await contactRepository.save(primaryContact);
  }
  
  // Collect emails and phone numbers, avoiding duplicates
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
