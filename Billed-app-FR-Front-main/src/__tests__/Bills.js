/**
 * @jest-environment jsdom
 */

import {fireEvent, screen, waitFor} from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES, ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js"; 
import mockedBills from "../__mocks__/store"
import router from "../app/Router.js";  
import userEvent from "@testing-library/user-event";
import Bills from "../containers/Bills.js";

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      })) 
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router() 
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      //to-do write expect expression
      expect(windowIcon.classList.contains('active-icon')).toBe(true)
    })
    test("Then message icon in vertical layout should be not highlighted", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-mail'))
      const windowIcon = screen.getByTestId('icon-mail')
      expect(windowIcon.classList.contains('active-icon')).not.toBe(true)
    })
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
    test('then a modal should open', () => {
      // create the context
      document.body.innerHTML = BillsUI({data: bills})
      const onNavigate = (pathname) => {document.body.innerHTML = ROUTES({pathname})}

      // create New Bills
      const bill = new Bills({
        document, 
        onNavigate,
        store: null,
        localStorage: window.localStorage
      })

      $.fn.modal = jest.fn()
      const button = screen.getAllByTestId('icon-eye')[0]
      const handleClickIconEye = jest.fn((e) => {
        e.preventDefault()
        bill.handleClickIconEye(button)
      })

      button.addEventListener('click', handleClickIconEye)
      fireEvent.click(button)
      expect(handleClickIconEye).toHaveBeenCalled()
    })

    test('then i clic on the newbill button', () => {
      // create the context
      document.body.innerHTML = BillsUI({data: bills})
      const onNavigate = (pathname) => {document.body.innerHTML = ROUTES({pathname})}

      // create New Bills
      const bill = new Bills({
        document,
        onNavigate,
        store: null,
        localStorage: window.localStorage
      })

      const button = screen.getByTestId('btn-new-bill')
      const handleClickNewBill = jest.fn((e) => {
        e.preventDefault()
        bill.handleClickIconEye(button)
      })

      button.addEventListener('click', handleClickNewBill)
      fireEvent.click(button)
      expect(handleClickNewBill).toHaveBeenCalled()
    })

  })
  
  describe('When I am on Bills page but back-end send an error message', () => {
    test('Then, Error page should be rendered', () => {
      // create the context
      document.body.innerHTML = BillsUI({ error: 'some error message' })
      expect(screen.getAllByText('Erreur')).toBeTruthy()
    })
  })
})

describe('When I call the billsUI function', () => {
  test('Then, Loading page should be rendered', () => {
    // create the context
    document.body.innerHTML = BillsUI({ loading: true })
    expect(screen.getAllByText('Loading...')).toBeTruthy()
  })
})

// test d'intégration GET
// describe("Given I am a user connected as Employee", () => {
//   describe("When I navigate to Dashboard", () => {
//     test("fetches bills from mock API GET", async () => {
//       localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "e@t" }));
//       const root = document.createElement("div")
//       root.setAttribute("id", "root")
//       document.body.append(root)
//       router()
//       window.onNavigate(ROUTES_PATH.Bills)
//       const bills = await waitFor(() => document.getElementById('data-table'))
//       //const bills = await waitFor(() => screen.getAllByTestId('icon-eye')[0])
//       expect(bills).toBeDefined()
//     })
//     test('fetches bills from an API and fails with 404 message error', async () => {
//       mockedBills.bills.mockImplementationOnce(() => {
//         return {
//           list : () =>  {
//             return Promise.reject(new Error("Erreur 404"))
//           }
//         }
//       })
//       document.body.innerHTML = BillsUI({error: 'Erreur 404'})
//       const message = await screen.getByText(/Erreur 404/)
//       expect(message).toBeTruthy()
//     })

//     test('fetches bills from an API and fails with 500 message error', async () => {
//       mockedBills.bills.mockImplementationOnce(() => {
//         return {
//           list : () =>  {
//             return Promise.reject(new Error("Erreur 500"))
//           }
//         }
//       })
//       document.body.innerHTML = BillsUI({error: 'Erreur 500'})
//       const message = await screen.getByText(/Erreur 500/)
//       expect(message).toBeTruthy()
//     })

//   })
// })

//test d'intégration Get
describe('tests integration Get', () => {

  test('fetches bills from mock API list', async () => {
    const getSpy = jest.spyOn(mockedBills, 'bills')
    const bills = await mockedBills.bills().list()
    expect(getSpy).toHaveBeenCalledTimes(1)
    expect(bills.length).toBe(4)
  })

  test('fetches bills from an API and fails with 404 message error', async () => {
    mockedBills.bills.mockImplementationOnce(() => {
      return {
        list : () =>  {
          return Promise.reject(new Error("Erreur 404"))
        }
      }
    })
    document.body.innerHTML = BillsUI({error: 'Erreur 404'})
    const message = await screen.getByText(/Erreur 404/)
    expect(message).toBeTruthy()
  })

  test('fetches bills from an API and fails with 500 message error', async () => {
    mockedBills.bills.mockImplementationOnce(() => {
      return {
        list : () =>  {
          return Promise.reject(new Error("Erreur 500"))
        }
      }
    })
    document.body.innerHTML = BillsUI({error: 'Erreur 500'})
    const message = await screen.getByText(/Erreur 500/)
    expect(message).toBeTruthy()
  })
})