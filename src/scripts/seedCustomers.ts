import { AppDataSource } from "@/config/data-source";
import { Appointment, AppointmentStatus, ReservationType } from "@/models/Appointment";
import { Bank } from "@/models/Bank";
import { Branch } from "@/models/Branch";
import { Customer } from "@/models/Customer";
import { Employee } from "@/models/Employee";
import { Service } from "@/models/Service";
import { Window } from "@/models/Window";
import { Feedback } from "@/models/Feedback";

async function addCompletedTasksForFebMar2025() {
  try {
    await AppDataSource.initialize();
    console.log("🔗 Database connected successfully");

    const appointmentRepo = AppDataSource.getRepository(Appointment);
    const bankRepo = AppDataSource.getRepository(Bank);
    const branchRepo = AppDataSource.getRepository(Branch);
    const customerRepo = AppDataSource.getRepository(Customer);
    const employeeRepo = AppDataSource.getRepository(Employee);
    const serviceRepo = AppDataSource.getRepository(Service);
    const windowRepo = AppDataSource.getRepository(Window);
    const feedbackRepo = AppDataSource.getRepository(Feedback);

    console.log("🏦 Finding National Bank of Egypt...");

    // Find NBE bank
    const nbeBank = await bankRepo.findOne({
      where: { name: "National Bank of Egypt" }
    });

    if (!nbeBank) {
      console.log("❌ National Bank of Egypt not found in database");
      await AppDataSource.destroy();
      return;
    }

    console.log("🏢 Finding NBE Cairo Downtown Branch...");

    // Find NBE Cairo Downtown branch
    const cairoBranch = await branchRepo.findOne({
      where: { 
        name: "NBE Cairo Downtown Branch",
        bank: { id: nbeBank.id }
      },
      relations: { bank: true }
    });

    if (!cairoBranch) {
      console.log("❌ NBE Cairo Downtown Branch not found in database");
      await AppDataSource.destroy();
      return;
    }

    // Get existing employees for this branch
    const employees = await employeeRepo.find({
      where: { 
        bank: { id: nbeBank.id },
        branch: { id: cairoBranch.id }
      }
    });

    if (employees.length === 0) {
      console.log("❌ No employees found for this branch");
      await AppDataSource.destroy();
      return;
    }

    // Get available services
    const services = await serviceRepo.find();
    if (services.length === 0) {
      console.log("❌ No services found in database");
      await AppDataSource.destroy();
      return;
    }

    // Get available windows
    const windows = await windowRepo.find({
      where: { branch: { id: cairoBranch.id } }
    });

    console.log(`👨‍💼 Found ${employees.length} employees`);
    console.log(`🔧 Found ${services.length} services`);
    console.log(`🪟 Found ${windows.length} windows`);

    // Customer names with Egyptian names
    const customerNames = [
      "Ahmed Mohamed Hassan", "Fatma Ali Ahmed", "Omar Mahmoud Ibrahim", 
      "Nour Hassan Mohamed", "Youssef Ahmed Ali", "Mariam Khaled Omar",
      "Amr Sayed Hassan", "Dina Mohamed Fouad", "Karim Ashraf Nabil",
      "Rana Ibrahim Mostafa", "Tamer Hosam Eldeen", "Sara Wael Mahmoud",
      "Mahmoud Gamal Abdel", "Nesma Tarek Fahmy", "Hossam Magdy Salem",
      "Yasmin Sherif Kamal", "Mostafa Adel Rashad", "Nada Emad Tawfik",
      "Khaled Waleed Samir", "Hadeel Osama Zaki", "Eslam Hany Fouad",
      "Nouran Yasser Helmy", "Abdallah Ramy Nour", "Salma Hesham Gamal",
      "Mohamed Amir Soliman", "Habiba Ihab Seif", "Sherif Amgad Lotfy",
      "Malak Taher Ashour", "Bassem Medhat Farid", "Lina Hazem Elshamy",
      "Hassan Kareem Fathy", "Aya Maged Elsayed", "Ziad Wafik Monir",
      "Norhan Sameh Badawy", "Adham Nader Zohdy", "Reem Walid Kassem",
      "Fady Mazen Ghaly", "Jana Osama Farag", "Seif Yehia Mansour",
      "Layla Hussam Darwish", "Saeed Mahmoud Eid", "Shimaa Ahmed Soliman",
      "Rami Ehab Mostafa", "Nayera Kareem Helal", "Sami Nour Eldeen",
      "Farida Amr Ezzat", "Hany Farouk Khalil", "Rowan Essam Abdo",
      "Hesham Ahmed Ragab", "Menna Taha Selim", "Mazen Ali Hegazy",
      "Dalia Ashraf Gaber", "Abdelrahman Omar Said", "Lamiaa Samy Fayek",
      "Emad Haitham Fouad", "Yara Amgad Shahin", "Tarek Eslam Hosny",
      "Nermeen Waleed Salah", "Wael Moustafa Elkady", "Lara Medhat Nazmy"
    ];

    // Phone number prefixes for Egyptian networks
    const phoneNumbers = [
      "01012345678", "01123456789", "01234567890", "01545678901",
      "01067890123", "01178901234", "01289012345", "01590123456",
      "01023456789", "01134567890", "01245678901", "01556789012",
      "01078901234", "01189012345", "01290123456", "01501234567",
      "01045678901", "01156789012", "01267890123", "01578901234",
      "01089012345", "01190123456", "01201234567", "01512345678",
      "01056789012", "01167890123", "01278901234", "01589012345",
      "01001234567", "01112345678", "01223456789", "01534567890",
      "01078945612", "01189056723", "01290167834", "01501278945",
      "01045689056", "01156790167", "01267801278", "01578912389",
      "01089023450", "01190134561", "01201245672", "01512356783",
      "01056689894", "01167790005", "01278801116", "01589012227",
      "01009876543", "01120987654", "01231098765", "01542109876",
      "01087654321", "01198765432", "01209876543", "01510987654",
      "01065432109", "01176543210", "01287654321", "01598765432",
      "01043210987", "01154321098", "01265432109", "01576543210",
      "01032109876", "01143210987", "01254321098", "01565432109"
    ];

    const addresses = [
      "15 Tahrir Square, Downtown Cairo", "8 Zamalek Street, Zamalek", 
      "22 Mohandessin Street, Giza", "45 Nasr City, Cairo",
      "12 Maadi Street, Maadi", "67 Heliopolis, Cairo",
      "33 Dokki Street, Giza", "18 Garden City, Cairo",
      "91 New Cairo, Cairo", "25 6th October City"
    ];

    let totalAdded = 0;
    const months = [
      { month: 2, year: 2025, name: "February", days: 28, tasksPerDay: 8 },
      { month: 3, year: 2025, name: "March", days: 31, tasksPerDay: 10 }
    ];

    for (const monthData of months) {
      console.log(`\n📅 Adding completed tasks for ${monthData.name} ${monthData.year}...`);
      
      for (let day = 1; day <= monthData.days; day++) {
        const date = new Date(monthData.year, monthData.month - 1, day);
        
        // Skip weekends (Friday = 5, Saturday = 6 in Egypt)
        if (date.getDay() === 5 || date.getDay() === 6) continue;
        
        for (let taskNum = 0; taskNum < monthData.tasksPerDay; taskNum++) {
          try {
            // Random selections
            const randomEmployee = employees[Math.floor(Math.random() * employees.length)];
            const randomService = services[Math.floor(Math.random() * services.length)];
            const randomWindow = windows.length > 0 ? windows[Math.floor(Math.random() * windows.length)] : null;
            const randomCustomerName = customerNames[Math.floor(Math.random() * customerNames.length)];
            const randomPhone = phoneNumbers[Math.floor(Math.random() * phoneNumbers.length)];
            const randomAddress = addresses[Math.floor(Math.random() * addresses.length)];

            // Create or find customer
            let customer = await customerRepo.findOne({
              where: { phoneNumber: randomPhone }
            });

            if (!customer) {
              // Generate unique email for each customer
              const emailSafeFullName = randomCustomerName.toLowerCase().replace(/\s+/g, '.');
              const randomNumber = Math.floor(Math.random() * 9999);
              const email = `${emailSafeFullName}.${randomNumber}@gmail.com`;

              customer = customerRepo.create({
                fullName: randomCustomerName,
                email: email,
                phoneNumber: randomPhone,
                preferredBranch: cairoBranch,
                homeLatitude: 30.0444 + (Math.random() - 0.5) * 0.1, // Cairo area latitude
                homeLongitude: 31.2357 + (Math.random() - 0.5) * 0.1, // Cairo area longitude
                questionnaireFilled: Math.random() < 0.3 ? 1 : 0 // 30% have filled questionnaire
              });
              await customerRepo.save(customer);
            }

            // Random appointment times during business hours (9 AM - 4 PM)
            const startHour = 9 + Math.floor(Math.random() * 7); // 9-15 (3 PM)
            const startMinute = Math.floor(Math.random() * 6) * 10; // 0, 10, 20, 30, 40, 50
            const duration = 15 + Math.floor(Math.random() * 46); // 15-60 minutes
            
            const startTime = `${startHour.toString().padStart(2, '0')}:${startMinute.toString().padStart(2, '0')}`;
            
            const endTotalMinutes = (startHour * 60 + startMinute + duration);
            const endHour = Math.floor(endTotalMinutes / 60);
            const endMinute = endTotalMinutes % 60;
            const endTime = `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;

            // Create appointment
            const appointment = appointmentRepo.create({
              appointmentStartDate: date,
              appointmentStartTime: startTime,
              appointmentEndTime: endTime,
              status: AppointmentStatus.COMPLETED,
              reservationType: Math.random() < 0.7 ? ReservationType.ONLINE : ReservationType.OFFLINE, // 70% online, 30% offline
              bank: nbeBank,
              branch: cairoBranch,
              customer: customer,
              service: randomService,
              employee: randomEmployee,
              window: randomWindow,
              createdAt: date,
              updatedAt: date
            });

            const savedAppointment = await appointmentRepo.save(appointment);

            // Create feedback (80% chance)
            if (Math.random() < 0.8) {
              const satisfactionRating = Math.floor(Math.random() * 5) + 1; // 1-5
              const timeResolutionRating = Math.floor(Math.random() * 5) + 1; // 1-5
              
              const commentsList = [
                "Excellent service, very professional staff",
                "Quick and efficient service",
                "Good service overall",
                "Average experience",
                "Could be improved",
                "Staff was very helpful",
                "Fast processing time",
                "Clean and organized branch"
              ];

              const feedback = feedbackRepo.create({
                satisfactionRating,
                timeResolutionRating,
                comment: commentsList[Math.floor(Math.random() * commentsList.length)],
                appointment: savedAppointment,
                employee: randomEmployee,
                branch: cairoBranch
              });

              await feedbackRepo.save(feedback);
            }

            totalAdded++;
            
            if (totalAdded % 50 === 0) {
              console.log(`✅ Added ${totalAdded} completed tasks...`);
            }

          } catch (error) {
            console.error(`❌ Error creating task for ${date.toDateString()}:`, error);
          }
        }
      }
      
      console.log(`✅ Completed adding tasks for ${monthData.name} ${monthData.year}`);
    }

    console.log(`\n🎉 Successfully added ${totalAdded} completed tasks for February and March 2025!`);
    console.log(`🏦 Bank: ${nbeBank.name}`);
    console.log(`🏢 Branch: ${cairoBranch.name}`);
    console.log(`👨‍💼 Employees: ${employees.map(e => e.fullName).join(', ')}`);

    // Verify the data
    console.log("\n🔍 Verifying data...");
    
    // Get all completed appointments for this branch and count by month
    const allCompletedTasks = await appointmentRepo.find({
      where: {
        bank: { id: nbeBank.id },
        branch: { id: cairoBranch.id },
        status: AppointmentStatus.COMPLETED
      }
    });

    // Count by month manually
    const feb2025Tasks = allCompletedTasks.filter(task => {
      if (!task.appointmentStartDate) return false;
      const date = new Date(task.appointmentStartDate);
      return date.getMonth() === 1 && date.getFullYear() === 2025; // February = month 1
    });

    const mar2025Tasks = allCompletedTasks.filter(task => {
      if (!task.appointmentStartDate) return false;
      const date = new Date(task.appointmentStartDate);
      return date.getMonth() === 2 && date.getFullYear() === 2025; // March = month 2
    });

    console.log(`📊 February 2025: ${feb2025Tasks.length} completed tasks`);
    console.log(`📊 March 2025: ${mar2025Tasks.length} completed tasks`);
    console.log(`📊 Total completed tasks: ${allCompletedTasks.length}`);

    await AppDataSource.destroy();
    console.log("\n✅ Database connection closed");

  } catch (error) {
    console.error("❌ Error adding completed tasks:", error);
    console.error("Full error details:", error);
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

// Run the script
addCompletedTasksForFebMar2025().catch((err) => {
  console.error("❌ Script failed:", err);
  process.exit(1);
});